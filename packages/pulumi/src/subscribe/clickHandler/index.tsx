const subscribeWebinyClickHandler = {};

export default subscribeWebinyClickHandler;
// import { PbButtonElementClickHandlerPlugin } from "@webiny/app-page-builder/types";
// import { loadStripe } from "@stripe/stripe-js";

// export default [
//   {
//     type: "pb-page-element-button-click-handler",
//     name: "stripe-checkout-click-handler",
//     title: "Stripe",
//     variables: [
//       { name: "priceId", label: "Stripe Price Id", defaultValue: "" },
//     ],
//     handler: async ({ variables }: { variables: any }) => {
//       console.log(
//         "String(process.env.REACT_APP_STRIPE_TEST_PUBLIC_KEY): ",
//         String(process.env.REACT_APP_STRIPE_PUBLIC_KEY)
//       );
//       console.log(
//         "String(process.env.REACT_APP_STRIPE_CHECKOUT_URL): ",
//         String(process.env.REACT_APP_STRIPE_CHECKOUT_URL)
//       );
//       const stripe: any = await loadStripe(
//         String(process.env.REACT_APP_STRIPE_PUBLIC_KEY)
//       );

//       const session: any = await fetch(
//         String(process.env.REACT_APP_STRIPE_CHECKOUT_URL),
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ priceId: variables.priceId }),
//         }
//       ).then((response) => response.json());

//       stripe.redirectToCheckout({ sessionId: session.id });
//     },
//   } as PbButtonElementClickHandlerPlugin<{ priceId: string }>,
// ];
