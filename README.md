# buddhistgeeks.training

buddhistgeeks.training is a web-app built on NextJS. It's
primarily written in Typescript.

Important libraries we use are:

- [prisma](https://prisma.io/) for database access
- [emotion](https://emotion.sh/) for writing CSS in JavaScript

## Structure

With NextJS, each page is a file in the `[/pages](./pages)` that exports a react
component. There's also the `/pages/api` directory in which each file defines an
API endpoint.

We also have couple other top level directories:

- `/components` has react components that are used across pages
- `/src` contains functions that are used across pages and api endpoints
- `/emails` contains functions that use the [Postmark](https://postmarkapp.com/)
  to send emails.
  - `/emails/templtaes` contains templates that are synced with postmark. Each
    template has an HTML and text version as well as some metadata for postmark.
    To view changes to this tempaltes you can use the
    [`postmark-cli`](https://github.com/wildbit/postmark-cli)
- `/writing` contains `.mdx` files for copy that will be rendered on the site,
  like the introduction text.
- `/prisma` contains the generated prisma schema and an SQL file,
  `prisma/create_tables.sql`, for creating the tables used by the database

## API Implementation and Usage

The API handlers in `/pages/api` are implemented using functions defined in
`src/apiHelpers.ts`. The goal of these functions is to make it easy to write
typed APIs on the back-end, and use them, with those types, on the front-end.

All API endpoints send and receive JSON data.

Each API endpoint file exports types that describe the expected request and the
possible responses.

To call the API from the frontend there is a `callAPI` function that takes both
those types as type parameters.
