import React from "react";
import styled from "@emotion/styled";
import { PbEditorPageElementPlugin, DisplayMode } from "@webiny/app-page-builder/types";
import { createInitialPerDeviceSettingValue } from "@webiny/app-page-builder/editor/plugins/elementSettings/elementSettingsUtils";

import icon from "./assets/mailchimp_logo.png";

import SubscribeFormEditor from "./components/subscribeFormEditor";

const PreviewBox = styled("div")({
    textAlign: "center",
    height: 75,
    svg: {
        height: 75,
        width: 75,
        color: "var(--mdc-theme-text-secondary-on-background)"
    }
});

export default () => {
    return [
        {
            name: "pb-editor-page-element-subscribe-form",
            type: "pb-editor-page-element",
            elementType: "subscribe-form",
            toolbar: {
                // We use `pb-editor-element-group-media` to put our plugin into the Media group.
                title: "Subscribe Form",
                group: "pb-editor-element-group-form",
                preview() {
                    return (
                        <PreviewBox>
                            <img
                                src={icon}
                                style={{ width: 75, marginTop: 6 }}
                                alt="subscribe form"
                            />
                        </PreviewBox>
                    );
                }
            },
            settings: [
                "pb-editor-page-element-settings-delete",
                "pb-editor-page-element-style-settings-padding",
                "pb-editor-page-element-style-settings-margin",
                "pb-editor-page-element-style-settings-horizontal-align-flex"
            ],
            target: ["cell", "block"],
            onCreate: "open-settings",
            create(options) {
                /*
                    Create function is here to create the initial data
                    for the page element, which then is utilized in the
                    MailchimpEditor component and in the element settings.
                */
                return {
                    type: "subscribe-form",
                    elements: [],
                    data: {
                        subscribeForm: {
                            heading: "",
                            subHeading: "",
                            ctaText: "",
                            placeholder: "",
                            successMessage: "",
                            errorMessage: "",
                            termsText: "",
                            tags: []
                        },
                        settings: {
                            margin: createInitialPerDeviceSettingValue(
                                {
                                    advanced: true,
                                    top: "0",
                                    right: "0",
                                    bottom: "0",
                                    left: "0"
                                },
                                DisplayMode.DESKTOP
                            ),
                            padding: createInitialPerDeviceSettingValue(
                                {
                                    advanced: true,
                                    top: "0",
                                    right: "0",
                                    bottom: "0",
                                    left: "0"
                                },
                                DisplayMode.DESKTOP
                            ),
                            horizontalAlignFlex: "center"
                        }
                    },
                    ...options
                };
            },
            render(props) {
                /*
                    Every render function receives the page element's
                    data assigned to the "element.data" property in
                    the received props. In here we will store the
                    "subscribe-form subscription parameters" which will 
                    be provided via the page element's settings.
                */
                return <SubscribeFormEditor {...props} />;
            },
            renderElementPreview({ width, height }) {
                return <img style={{ width, height }} alt={"Subscribe Form"} />;
            }
        } as PbEditorPageElementPlugin
    ];
};
