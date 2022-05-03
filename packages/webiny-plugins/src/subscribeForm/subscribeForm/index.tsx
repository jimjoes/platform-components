import React, { useState } from "react";
import useFetch from "use-http";
import { Form, Field } from "react-final-form";
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
const { useQueryString } = require("./queryString");

type Submission = { email: string; tags?: string[]; referrer?: string };

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

export const SubscribeForm = ({
  data: {
    ctaText = "Subscribe",
    successMessage = "You have applied successfully. Sit back, relax, and we will ll get back to you soon!",
    errorMessage = "There was a problem. Maybe you've already subscribed?",
    termsText = "*By signing up, you agree to the Terms of Service.",
    tags = [],
  },
}: SubscribeFormProps) => {
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
    setSubmitting(true);
    console.log(formValues);
    const submission: Submission = {
      email: formValues.email,
    };
    if (tags && Array.isArray(tags) && tags.length > 0) {
      submission.tags = tags;
    }
    if (referrer && typeof referrer === "string" && referrer.length > 0) {
      submission.referrer = String(referrer);
    }
    try {
      await post("/subscribe", submission);
      console.log("response: ", response);
      if (response.data.status || fetchError) {
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
      render={({ handleSubmit }: { handleSubmit: any }) => (
        <FormContainer onSubmit={handleSubmit}>
          <SignupFieldContainer>
            <>
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
                        <h1>Loading</h1>
                      ) : (
                        <Button>{ctaText}</Button>
                      )}
                    </SignupFieldContainer>
                  );
                }}
              </Field>
            </>
          </SignupFieldContainer>
          <TermsContainer>
            <Error>{error && error}</Error>
            <Terms className="terms">{termsText}</Terms>
          </TermsContainer>
        </FormContainer>
      )}
    />
  );
};
