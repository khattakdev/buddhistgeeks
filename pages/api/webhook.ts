import { NextApiRequest, NextApiResponse} from 'next'
import Stripe from 'stripe'
import {PrismaClient} from '@prisma/client'
import { getUsername, addMember, getTaggedPost, } from 'src/discourse'
import {DISCOURSE_URL} from 'src/constants'
import { sendCohortEnrollmentEmail, sendEnrollNotificationEmaill, sendEventRSVPEmail } from 'emails';
import { prettyDate } from '../../src/utils';
import { StripePaymentMetaData } from 'src/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET || '', {apiVersion:'2020-08-27'});
const prisma = new PrismaClient()

export const config = {
  api: {
    bodyParser: false
  }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const sig = req.headers['stripe-signature'];
  if(!sig) return res.status(400).send(`Webhook Error: No signature!`);
  let event
  try {
    let body:string = await new Promise(resolve => {
      let chunks: Uint8Array[] = []
      req.on('data', (chunk) => {
        chunks.push(chunk);
      }).on('end', () => {
        resolve(Buffer.concat(chunks).toString());
      });
    })
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK as string);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {

    const {metadata, amount_total, payment_intent, customer} = event.data.object as Stripe.Checkout.Session & {metadata: StripePaymentMetaData};
    if(!amount_total ||!payment_intent || !customer ||
      typeof payment_intent !== 'string' ||typeof customer !== 'string') return {status: 400, result: "ERROR: missing expected parameters, amount_total, payment_intent, or customer"}

    switch(metadata.type) {
        case 'cohort': {
          let cohortId = parseInt(metadata.cohortId)
          let person = await prisma.people.findUnique({where: {id: metadata.userId}})
          if(!person) return {status: 400, result: "ERROR: cannot find user with id: " + metadata.userId} as const

          let [cohort, discount] = await Promise.all([
            prisma.course_cohorts.findUnique({
              where: {id: cohortId},
              include: {
                discourse_groups: true,
                cohort_facilitators: {select:{people:{select:{email:true}}}},
                courses: {
                  select: {
                    course_groupTodiscourse_groups: true,
                    category_id: true,
                    slug: true,
                    name: true
                  }
                },
                people_in_cohorts: {
                  where: {
                    person: person.id
                  }
                }
              }
            }),
            metadata.discount ? prisma.course_discounts.findUnique({where:{code:metadata.discount}}) : null
          ])

          if(!cohort) return {status: 400, result: "ERROR: no cohort with id: " + metadata.cohortId}
          if(cohort.people_in_cohorts.length > 0) return {status:200, result: "User is already enrolled"}

          let username = await getUsername(metadata.userId)

          if(!username) return res.status(400).send('ERROR: Cannot find user: ' + metadata.userId)

          let gettingStarted = await getTaggedPost(cohort.category_id, 'getting-started')

          await Promise.all([
            !person.stripe_customer_id ? prisma.people.update({where:{id: person.id}, data:{stripe_customer_id: customer}}) : null,
            discount ? prisma.course_discounts.update({
              where: {code: discount.code},
              data: {
                redeems: {
                  increment: 1
                }
              }}) : null,
            prisma.people_in_cohorts.create({data: {
              payment_intent,
              amount_paid: amount_total/100,
              people: {connect: {id: metadata.userId}},
              course_cohorts: {connect: {id: cohortId}},
              course_discounts: discount ? {connect:{code: discount.code}} : undefined
            }}),

            addMember(cohort.discourse_groups.id, username),
            addMember(cohort.courses.course_groupTodiscourse_groups.id, username),
            sendCohortEnrollmentEmail(person.email, {
              name: person.display_name || person.username,
              course_start_date: prettyDate(cohort.start_date),
              course_name: cohort.courses.name,
              cohort_page_url: `https://hyperlink.academy/courses/${cohort.courses.slug}/${cohort.course}/cohorts/${cohort.id}`,
              cohort_forum_url: `${DISCOURSE_URL}/session/sso?return_path=/c/${cohort.category_id}`,
              get_started_topic_url: `${DISCOURSE_URL}/t/${gettingStarted.id}`
            }),
            Promise.all([cohort.cohort_facilitators.map(async (f) => person && cohort && sendEnrollNotificationEmaill(f.people.email, {
              learner: person.display_name || person.username,
              course: cohort.courses.name,
              cohort_page_url: `https://hyperlink.academy/courses/${cohort.courses.slug}/${cohort.course}/cohorts/${cohort.id}`,
              cohort_forum_url: `${DISCOURSE_URL}/session/sso?return_path=/c/${cohort.category_id}`,
            }))])
          ])
          break
        }
        case 'event': {
          let eventId = parseInt(metadata.eventId)
          let [person, event] = await Promise.all([
            prisma.people.findUnique({where: {id: metadata.userId}}),
            prisma.standalone_events.findUnique({where: {event: eventId}, select:{events: true}})
          ])
          if(!person) return {status: 400, result: "ERROR: cannot find user with id: " + metadata.userId} as const
          if(!event) return {status:400, result: "ERROR: cannot find event with id: "+eventId}

          await Promise.all([
            sendEventRSVPEmail(person.email, {
              name: person.display_name || person.username,
              event_page_url: `https://hyperlink.academy/events/${event.events.id}`,
              event_name: event.events.name
            }),
            prisma.people_in_events.create({data:{
              events:{connect:{id: event.events.id}},
              people:{connect:{id:person.id}}
            }})
          ])
          break
        }
    }
  }
  if (event.type === 'account.updated') {
    const {details_submitted, payouts_enabled, id} = event.data.object as {id: string, details_submitted: boolean, payouts_enabled: boolean, metadata: Stripe.Metadata} ;
    if(details_submitted) await prisma.stripe_connected_accounts.update({
      where:{stripe_account:id},
      data:{
        connected: true,
        payouts_enabled
      }
    })

  }

  res.status(200).end()
}
