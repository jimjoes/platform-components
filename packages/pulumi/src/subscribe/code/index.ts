const subscribeHandler = {};

export default subscribeHandler;

// const DOMAIN = process.env.DOMAIN;
// const STRIPE_API_KEY = process.env.STRIPE_API_KEY;

// import middy from "@middy/core";
// import validator from "@middy/validator";
// import httpErrorHandler from "@middy/http-error-handler";
// import jsonBodyParser from "@middy/http-json-body-parser";
// import cors from "@middy/http-cors";

// import Ajv from "ajv";
// const stripe = require("stripe")(STRIPE_API_KEY);

// const ajv = new Ajv();

// const outputSchema = {
//   type: "object",
//   required: ["body", "statusCode"],
//   properties: {
//     body: {
//       type: "string",
//     },
//     statusCode: {
//       type: "number",
//     },
//     headers: {
//       type: "object",
//     },
//   },
// };

// const baseHandler = async (event: any) => {
//   console.log("event: ", JSON.stringify(event));
//   const { priceId } = event.body;

//   if (!priceId) {
//     return {
//       statusCode: 400,
//       headers: { "Content-Type": "text/string" },
//       body: "a priceID is required",
//       retryable: false,
//     };
//   }

//   try {
//     const params = {
//       mode: "subscription",
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price: priceId,
//           // For metered billing, do not pass quantity
//           quantity: 1,
//         },
//       ],
//       // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
//       // the actual Session ID is returned in the query parameter when your customer
//       // is redirected to the success page.
//       success_url: `https://${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `https://${DOMAIN}/cancel`,
//     };
//     console.log("params: ", params);

//     const session = await stripe.checkout.sessions.create(params);
//     console.log("session: ", session);

//     return {
//       statusCode: 200,
//       headers: { "Content-Type": "text/string" },
//       body: JSON.stringify(session.url),
//     };
//   } catch (error) {
//     console.log("overall error: ", error);
//     return {
//       statusCode: 500,
//       headers: { "Content-Type": "text/string" },
//       body: JSON.stringify(error),
//     };
//   }
// };

// const handler = middy(baseHandler)
//   .use(jsonBodyParser())
//   .use(
//     validator({
//       outputSchema: ajv.compile(outputSchema),
//     })
//   )
//   .use(httpErrorHandler())
//   .use(cors());

// export default handler;
