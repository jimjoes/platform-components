import React, { useState, useRef } from "react";
import useFetch from "use-http";
import { useForm } from "react-hook-form";
import ReCAPTCHA from "react-google-recaptcha";
import { useQueryString } from "./queryString";
//@ts-ignore
import { useSnackbar } from "react-simple-snackbar";
import { sendEvent, sendUserId } from "../../utils/useGtm";

import {
  FormContainer,
  SignupFieldContainer,
  Input,
  Button,
  CompletedText,
  TermsContainer,
  Error,
  Terms,
  Spinner,
} from "./styled";

const snackbarOptions = {
  style: {
    backgroundColor: "#B7BCB6",
    borderRadius: "4px",
    color: "black",
    fontSize: "14px",
    textAlign: "center",
  },
};

type Submission = {
  email: string;
  humanKey: string;
  tags?: string[];
  referrer?: string;
};

type SubscribeFormData = {
  placeholder?: string;
  ctaText?: string;
  successMessage?: string;
  termsText?: string;
  tags?: string[];
};

type SubscribeFormProps = {
  data: SubscribeFormData;
};

type FormValues = {
  email: string;
};

const recaptchaSiteKey = String(process.env.REACT_APP_RECAPTCHA_SITE_KEY);

console.log("recaptchaSiteKey: ", recaptchaSiteKey);

export const SubscribeForm = ({
  data: {
    ctaText = "Subscribe",
    successMessage = "You have applied successfully. Sit back, relax, and we will get back to you soon!",
    termsText = "*By signing up, you agree to the Terms of Service.",
    placeholder = "Enter your email and...",
    tags = [],
  },
}: SubscribeFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const [openSnackbar] = useSnackbar(snackbarOptions);
  const recaptchaRef = useRef(null);
  const [referrer] = useQueryString({ key: "r" });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const {
    post,
    response,
    loading,
    error: fetchError,
  } = useFetch(process.env.REACT_APP_REST_API_URL);

  const onSubmit = async (formValues: FormValues) => {
    setSubmitting(true);
    // @ts-ignore
    recaptchaRef.current.reset();
    //@ts-ignore
    let recaptchaToken = await recaptchaRef.current.executeAsync();
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
      const data = await post("/subscribe", submission);
      console.log("response: ", JSON.stringify(response));
      console.log("fetchError: ", fetchError);
      if (!response.ok || fetchError) {
        openSnackbar(response?.data?.message);
        setSubmitting(false);
        setSubmitted(false);
        reset();
      } else {
        sendEvent("userRegistered");
        if (data?.id) {
          sendUserId(data.id);
        }
        openSnackbar("Successfully subscribed. Please check your email.");
        setSubmitting(false);
        setSubmitted(true);
        reset();
      }
    } catch (error: any) {
      openSnackbar(
        error?.message ? error.message : "There was an error. Please try again"
      );
      setSubmitting(false);
      setSubmitted(false);
      reset();
    }
  };

  if (submitted) {
    return <CompletedText>{successMessage}</CompletedText>;
  }

  const formFields = {
    email: "email" as const,
  };

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <SignupFieldContainer>
        <Input
          {...register(formFields.email, {
            required: true,
            pattern:
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          })}
          type={"email"}
          placeholder={placeholder}
        />

        <Button>{loading || submitting ? <Spinner /> : ctaText}</Button>
      </SignupFieldContainer>
      <TermsContainer>
        {errors.email?.type === "required" && (
          <Error> An email address is required</Error>
        )}
        {errors.email?.type === "pattern" && (
          <Error>Email address must be valid</Error>
        )}
        <Terms className="terms">{termsText}</Terms>
      </TermsContainer>
      <ReCAPTCHA
        sitekey={recaptchaSiteKey}
        size="invisible"
        ref={recaptchaRef}
      />
    </FormContainer>
  );
};
