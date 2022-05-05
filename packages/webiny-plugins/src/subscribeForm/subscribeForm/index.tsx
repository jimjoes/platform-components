import React, { useState, useRef } from "react";
import useFetch from "use-http";
import { Form, Field } from "react-final-form";
import ReCAPTCHA from "react-google-recaptcha";
import { useQueryString } from "./queryString";
// import { errorOptions } from "./errorStyles";
import {
  FormContainer,
  SignupFieldContainer,
  Input,
  Button,
  CompletedText,
  TermsContainer,
  Error,
  Terms,
} from "./styled";

const validator = require("validator");

type Submission = {
  email: string;
  humanKey: string;
  tags?: string[];
  referrer?: string;
};

type SubscribeFormData = {
  ctaText?: string;
  successMessage?: string;
  errorMessage: string;
  termsText: string;
  tags?: string[];
};

type SubscribeFormProps = {
  data: SubscribeFormData;
};

const recaptchaSiteKey = String(process.env.REACT_APP_RECAPTCHA_SITE_KEY);

export const SubscribeForm = ({
  data: {
    ctaText = "Subscribe",
    successMessage = "You have applied successfully. Sit back, relax, and we will get back to you soon!",
    errorMessage = "There was a problem. Maybe you've already subscribed?",
    termsText = "*By signing up, you agree to the Terms of Service.",
    tags = [],
  },
}: SubscribeFormProps) => {
  const recaptchaRef = useRef(null);
  const [referrer] = useQueryString({ key: "r" });
  // const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<null | string>();

  const {
    post,
    response,
    loading,
    error: fetchError,
  } = useFetch(process.env.REACT_APP_REST_API_URL);

  const onSubmit = async (formValues: any) => {
    //@ts-ignore
    const recaptchaToken = await recaptchaRef.current.executeAsync();
    setSubmitting(true);
    console.log(formValues);
    const submission: Submission = {
      email: formValues.email,
      humanKey: recaptchaToken,
    };
    if (tags && Array.isArray(tags) && tags.length > 0) {
      submission.tags = tags;
    }
    if (
      referrer &&
      typeof referrer === "string" &&
      referrer.length > 0 &&
      referrer !== "undefined"
    ) {
      submission.referrer = String(referrer);
    }
    try {
      await post("/subscribe", submission);
      console.log("response: ", response);
      if (response?.data?.status || fetchError) {
        setSubmitting(false);
        throw errorMessage;
      }
      setSubmitted(true);
      setSubmitting(false);
    } catch (error) {
      console.log(error);
    }
  };

  const requiredEmail = (value: any) => {
    if (!value) {
      return "An email is required";
    }
    if (!validator.isEmail(value)) {
      return "Invalid email address";
    }
    return undefined;
  };

  // const onChangeCheckbox = (index: number) => {
  //     setChecked(index);
  // };

  return submitted || loading ? (
    loading ? (
      <CompletedText>Loading...</CompletedText>
    ) : (
      <CompletedText>{successMessage}</CompletedText>
    )
  ) : (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, form }: { handleSubmit: any; form: any }) => (
        <FormContainer
          onSubmit={(event) => {
            handleSubmit(event).then(form.change("email", ""));
          }}
        >
          <SignupFieldContainer>
            <Field name="email" validate={requiredEmail}>
              {({ input, meta }: { input: any; meta: any }) => {
                if (meta.error && meta.touched) {
                  setError(meta.error);
                }
                if (!meta.error && meta.touched) {
                  setError(null);
                }
                return (
                  <SignupFieldContainer>
                    <Input
                      {...input}
                      type="email"
                      placeholder="Enter your email and..."
                    />
                    {submitting ? (
                      <Button>✓</Button>
                    ) : (
                      <Button>{ctaText}</Button>
                    )}
                  </SignupFieldContainer>
                );
              }}
            </Field>
          </SignupFieldContainer>
          <TermsContainer>
            <Error>{error && error}</Error>
            <Terms className="terms">{termsText}</Terms>
          </TermsContainer>
          <ReCAPTCHA
            sitekey={recaptchaSiteKey}
            size="invisible"
            ref={recaptchaRef}
          />
        </FormContainer>
      )}
    />
  );
};
