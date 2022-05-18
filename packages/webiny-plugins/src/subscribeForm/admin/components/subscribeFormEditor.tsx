import React from "react";
import { css } from "emotion";
import styled from "@emotion/styled";
import { ElementRoot } from "@webiny/app-page-builder/render/components/ElementRoot";
import icon from "../assets/mailchimp_logo.png";

import {
  FormContainer,
  SignupFieldContainer,
  Input,
  Button,
  TermsContainer,
  Error,
  Terms,
} from "../../subscribeForm/styled";

const outerWrapper = css({
  boxSizing: "border-box",
});

const PreviewBox = styled("div")({
  textAlign: "center",
  height: 50,
  svg: {
    height: 50,
    width: 50,
    color: "var(--mdc-theme-text-secondary-on-background)",
  },
});

const SubscribeFormEditor = ({ element }: { element: any }) => {
  if (!element.data.subscribeForm) {
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

  return (
    <ElementRoot
      className={"webiny-pb-base-page-element-style " + outerWrapper}
      element={element}
    >
      <FormContainer>
        <SignupFieldContainer>
          <Input type="email" placeholder="Enter your email and..." />

          <Button>{element.data.subscribeForm.ctaText}</Button>
        </SignupFieldContainer>
        <TermsContainer>
          <Error> Missing email </Error>

          <Error>Email address invalid</Error>

          <Terms className="terms">
            {element.data.subscribeForm.termsText}
          </Terms>
        </TermsContainer>
      </FormContainer>
    </ElementRoot>
  );
};

export default SubscribeFormEditor;
