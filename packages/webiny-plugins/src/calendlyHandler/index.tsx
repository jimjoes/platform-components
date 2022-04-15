import { PbButtonElementClickHandlerPlugin } from "@webiny/app-page-builder/types";
import { loadCalendly } from "./loadCalendly";

export default [
    // Registers a click handler that depends on two variables (color and size).
    {
        type: "pb-page-element-button-click-handler",
        name: "calendly-click-handler",
        title: "Calendly",
        // Here are the variables that users will be able to set via the
        // button's "Action" settings (in the Page Builder editor).
        variables: [{ name: "link", label: "Event Booking Link", defaultValue: "" }],
        // Once the button is clicked, we simply log the received variables.
        handler: function ({ variables }) {
            //@ts-ignore
            loadCalendly(() => {
                //@ts-ignore
                window.Calendly.showPopupWidget(variables.link);
            });
        }
    } as PbButtonElementClickHandlerPlugin<{ link: string }>
];
