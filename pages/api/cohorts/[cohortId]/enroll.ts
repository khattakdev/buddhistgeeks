import { PrismaClient } from "@prisma/client"
import * as rt from 'runtypes'
import { ResultType, APIHandler, Request } from "src/apiHelpers"
import {StripePaymentMetaData, stripe} from 'src/stripe'
import { sendCohortEnrollmentEmail, sendEnrollNotificationEmaill, sendUnenrollEmail } from 'emails'
import { getToken } from "src/token";
import { addMember, getTaggedPost } from "src/discourse";
import {DISCOURSE_URL} from 'src/constants'
import { prettyDate } from "src/utils"

let prisma = new PrismaClient()
export type EnrollResponse= ResultType<typeof enroll>
export type EnrollMsg  = rt.Static<typeof EnrollMsgValidator>
export type UnEnrollMsg = rt.Static<typeof UnEnrollMsgValidator>
export type UnEnrollResponse=ResultType<typeof unenroll>

export default APIHandler({
  POST: enroll,
  DELETE: unenroll
})

let EnrollMsgValidator = rt.Record({
  discount: rt.Union(rt.Undefined, rt.String)
})

let UnEnrollMsgValidator = rt.Record({
  person: rt.String,
})

async function enroll (req: Request) {
  let cohortId = parseInt(req.query.cohortId as string)
  if(Number.isNaN(cohortId)) return {status: 400, result: "ERROR: Cohort id is not a number"} as const
  let user = getToken(req)
  if(!user) return {status: 401, result: "Error: no user logged in"} as const

  let msg
  try {msg = EnrollMsgValidator.check(req.body)}
  catch(e) {return {status:400, result:e.toString()} as const }

  let [cohort, person, discount] = await Promise.all([
    prisma.course_cohorts.findUnique({
      where: {id: cohortId},
      include: {
        discourse_groups: true,
        cohort_facilitators:{select:{people:{select:{email: true}}}},
        courses: {
          select: {
            course_groupTodiscourse_groups: true,
            invite_only: true,
            category_id: true,
            cost: true,
            slug: true,
            name: true,
            course_invites:{
              where: {
                email: user.email
              }
            }
          }
        }
      }
    }),
    prisma.people.findUnique({where:{id:user.id}}),
    msg.discount ? prisma.course_discounts.findUnique({where: {code: msg.discount}}) : null
  ])

  if(!cohort || cohort.courses.cost === undefined) return {status: 400, result: "Error: no cohort with id " + cohortId + " found"}  as const
  if(msg.discount && (!discount || discount.deleted)) return {status: 404, result: {discount: msg.discount}} as const
  if(discount && discount.max_redeems !== 0 &&discount.max_redeems <= discount.redeems) return {
    status: 403,
    result: {
      message: "ERROR: Discount code has no uses left",
      discount: msg.discount
    }
  } as const

  if(cohort.courses.invite_only && cohort.courses.course_invites.length === 0){
    return {status: 401, result: "ERROR: Course is invite_only and user is not invited"} as const
  }

  let origin = (new URL(req.headers.referer || '')).origin
  let price = cohort.courses.cost
  if(discount) {
    if(discount.type === 'absolute') price = price - discount.amount
    else price = price - (Math.floor((discount.amount/100)*price))
  }
  if(price === 0) {
    let gettingStarted = await getTaggedPost(cohort.category_id, 'getting-started')
    await Promise.all([
      discount ? prisma.course_discounts.update({where:{code: discount.code}, data:{redeems:{increment: 1}}}) : null,
      prisma.people_in_cohorts.create({data: {
        amount_paid: 0,
        people: {connect: {id: user.id}},
        course_cohorts: {connect: {id: cohortId}},
        course_discounts: discount ? {connect:{code: discount.code}} : undefined
      }}),
      addMember(cohort.discourse_groups.id, user.username),
      addMember(cohort.courses.course_groupTodiscourse_groups.id, user.username),
      sendCohortEnrollmentEmail(user.email, {
        name: user.display_name || user.username,
        course_start_date: prettyDate(cohort.start_date),
        course_name: cohort.courses.name,
        cohort_page_url: `${origin}/courses/${cohort.courses.slug}/${cohort.course}/cohorts/${cohort.id}`,
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
    return {
      status: 200,
      result: {zeroCost: true} as const
    }
  }

  let metadata: StripePaymentMetaData = {
    type: 'cohort',
    cohortId: cohort.id.toString(),
    userId: user.id,
    discount: discount?.code || null
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer: person?.stripe_customer_id || undefined,
    customer_email: person?.stripe_customer_id ? undefined : user.email,
    payment_intent_data: {
      transfer_group: cohort.id.toString()
    },
    line_items: [{
      name: cohort.courses.name +
        (discount ? `, ${discount?.type === 'absolute' ? '$'+discount?.amount : discount?.amount+"%"} Off` : ''),
      amount: price * 100,
      currency: 'usd',
      quantity: 1,
    }],
    cancel_url: `${origin}/courses/${cohort.courses.slug}/${cohort.course}/cohorts/${cohort.id}`,
    success_url: `${origin}/courses/${cohort.courses.slug}/${cohort.course}/cohorts/${cohort.id}?welcome`,
    metadata
  });

  return {
    status: 200,
    result: {sessionId: session.id}
  } as const
}
async function unenroll (req: Request) {
  let cohortId = parseInt(req.query.cohortId as string)
  if(Number.isNaN(cohortId)) return {status: 400, result: "ERROR: Cohort id is not a number"} as const
  let user = getToken(req)
  if(!user) return {status: 401, result: "Error: no user logged in"} as const

  let msg:UnEnrollMsg
  try {msg = UnEnrollMsgValidator.check(req.body)}
  catch(e) {return {status:400, result:e.toString()} as const }

  let [cohort] = await Promise.all([
    prisma.course_cohorts.findUnique({
      where: {id: cohortId},
      select: {
        cohort_facilitators: true,
        courses:{
          select:{
            name: true
          }
        },
        discourse_groups: true,
        people: {
          select:{email: true}
        },
        people_in_cohorts: {
          select: {person: true, payment_intent: true, amount_paid: true, people:{select:{display_name: true, email: true, username: true}}}
        }
      }
    }),
  ])
  if(!cohort) return {status:404, result:"ERROR: no cohort found with id: "+cohortId} as const
  if(!cohort.cohort_facilitators.find(f=>user&&f.facilitator===user.id)) return {status:401, result:`ERROR: User is not facilitator of cohort`} as const

  let person = cohort.people_in_cohorts.find(p=>p.person===msg.person)
  if(!person) return {status:404, result: "ERROR: User is not in cohort"} as const
  if(!person.payment_intent && person.amount_paid !== 0) return {status: 500, result: "ERROR: Amount paid is greater than zero but there is not payment information"} as const


  await Promise.all([
    sendUnenrollEmail(person.people.email, {
      name: person.people.display_name || person.people.username,
      course_name:  cohort.courses.name,
      paid: person. amount_paid > 0 ? 'true' : ''
    }),
    prisma.people_in_cohorts.delete({where:{person_cohort:{
      person: msg.person,
      cohort: cohortId
    }}}),
    !person.payment_intent ? undefined : prisma.refunds.create({
      data:{
        payment_intent: person.payment_intent,
        amount: person.amount_paid,
        cohort_refunds: {
          create:{
            course_cohorts: {
              connect:{
                id: cohortId
              }
            },
            people:{
              connect: {id: person.person}
            }
          }
        }
      }
    }),
   !person.payment_intent ? undefined : stripe.refunds.create({payment_intent: person.payment_intent})
  ])

  return {status: 200, result: {payment_intent: person.payment_intent, person: person.person}} as const

}
