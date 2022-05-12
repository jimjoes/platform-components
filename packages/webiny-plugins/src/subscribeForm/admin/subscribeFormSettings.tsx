import React from "react";
import { Input } from "@webiny/ui/Input";
import { Cell, Grid } from "@webiny/ui/Grid";
import { PbEditorPageElementAdvancedSettingsPlugin } from "@webiny/app-page-builder/types";
import { DelayedOnChange } from "@webiny/app-page-builder/editor/components/DelayedOnChange";
import {
  ButtonContainer,
  classes,
  SimpleButton,
} from "@webiny/app-page-builder/editor/plugins/elementSettings/components/StyledComponents";
import Accordion from "@webiny/app-page-builder/editor/plugins/elementSettings/components/Accordion";

export default {
  name: "pb-editor-page-element-advanced-settings-subscribe-form",
  type: "pb-editor-page-element-advanced-settings",
  elementType: "subscribe-form",
  render({ Bind, submit }) {
    return (
      <>
        <Accordion title={"Subscribe Form"} defaultValue={true}>
          <React.Fragment>
            <Bind name={"subscribeForm.ctaText"}>
              <Input
                label={"CTA Text"}
                description={"Form submit button text"}
              />
            </Bind>
            <Bind name={"subscribeForm.placeholder"}>
              <Input
                label={"Placeholder"}
                description={"Email field placeholder"}
              />
            </Bind>
            <Bind name={"subscribeForm.successMessage"}>
              <Input
                label={"Success text"}
                description={"Form submmit success message"}
              />
            </Bind>
            <Bind name={"subscribeForm.errorMessage"}>
              <Input
                label={"Error text"}
                description={"Form submmit error message"}
              />
            </Bind>
            <Bind name={"subscribeForm.termsText"}>
              <Input label={"T&C text"} description={"Form submit terms"} />
            </Bind>
            <Bind name={"subscribeForm.tags"}>
              <DelayedOnChange>
                {({ value, onChange }: any) => {
                  // const value,
                  //     setValue = Array.isArray(initialValue)
                  //         ? initialValue
                  //         : typeof initialValue === "string"
                  //         ? initialValue.split(",")
                  //         : [];
                  return (
                    <>
                      <div
                        onClick={() => {
                          const tempArray = [...value];
                          tempArray.push("");
                          onChange(tempArray);
                        }}
                        style={{
                          borderRadius: "0.25rem",
                          backgroundColor: "#4CAF50",
                          border: "none",
                          cursor: "pointer",
                          color: "white",
                          padding: "6px 12px",
                          textAlign: "center",
                          textDecoration: "none",
                          display: "inline-block",
                          fontSize: 12,
                          marginTop: 6,
                          marginBottom: 6,
                        }}
                      >
                        Add
                      </div>
                      {value.map((tag: any, index: any) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Input
                            value={tag}
                            onChange={(val: any) => {
                              const tempArray = [...value];
                              tempArray[index] = val;
                              onChange(tempArray);
                            }}
                          />
                          <div
                            style={{
                              borderRadius: "0.25rem",
                              backgroundColor: "var()",
                              border: "none",
                              color: "white",
                              padding: "6px 12px",
                              textAlign: "center",
                              textDecoration: "none",
                              display: "inline-block",
                              cursor: "pointer",
                              fontSize: 12,
                              height: 16,
                              marginTop: 6,
                              marginLeft: 3,
                            }}
                            onClick={() => {
                              const tempArray = [...value];
                              tempArray.splice(index);
                              onChange(tempArray);
                            }}
                          >
                            Remove
                          </div>
                        </div>
                      ))}
                    </>
                  );
                }}
              </DelayedOnChange>
            </Bind>
            <Grid className={classes.simpleGrid}>
              <Cell span={12}>
                {/*  @ts-ignore */}
                <ButtonContainer>
                  {/*  @ts-ignore */}
                  <SimpleButton onClick={submit}>Save</SimpleButton>
                </ButtonContainer>
              </Cell>
            </Grid>
          </React.Fragment>
        </Accordion>
      </>
    );
  },
} as PbEditorPageElementAdvancedSettingsPlugin;
