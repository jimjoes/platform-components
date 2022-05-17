import * as React from "react";
// import { useNavigate } from "react-router-dom";
import { useIntl, FormattedMessage } from "react-intl";
import { Button, Grid, Box } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";
import { Formik, Form } from "formik";
import { usePasswordlessSignIn } from "@jimjoes/amplify-auth-hooks";

import { FormSection, SectionHeader } from "../ui";
import { useNotificationContext } from "../notification";
import { useUsernameField } from "./use-username-field";
import { ChangeAuthStateLink } from "./change-auth-state-link";
import { UsernameAttribute } from "./types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      width: "100%", // Fix IE 11 issue.
      margin: theme.spacing(2),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  })
);

export interface SignInProps {
  hideSignUpLink?: boolean;
  hideForgotPasswordLink?: boolean;
  usernameAttribute?: UsernameAttribute;
}

export const SignInPasswordless: React.FC<SignInProps> = (props) => {
  const {
    hideSignUpLink = false,
    hideForgotPasswordLink = false,
    usernameAttribute,
  } = props;
  // const navigate = useNavigate();
  const classes = useStyles();
  const { formatMessage } = useIntl();
  const { showNotification } = useNotificationContext();
  const signIn = usePasswordlessSignIn();
  const { usernamefieldName, usernameField } =
    useUsernameField(usernameAttribute);

  return (
    <Formik<{ [fieldName: string]: string }>
      initialValues={{
        [usernamefieldName]: "",
      }}
      onSubmit={async (values): Promise<void> => {
        try {
          await signIn(values[usernamefieldName].trim());
        } catch (error: any) {
          const content = formatMessage({
            id: `signIn.errors.${error.code}`,
            defaultMessage: error.message,
          });
          showNotification({ content, variant: "error" });
        }
      }}
    >
      {({ handleSubmit, isValid }): React.ReactNode => (
        <FormSection>
          <SectionHeader>
            <FormattedMessage
              id="signIn.header"
              defaultMessage="Sign in to your account"
            />
          </SectionHeader>
          <Form
            onSubmit={handleSubmit}
            data-testid="signInForm"
            style={{ width: "80%" }}
            //noValidate
          >
            <Box
              sx={{
                mt: 2,
              }}
            >
              {usernameField}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                disabled={!isValid}
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                data-testid="signInSubmit"
              >
                <FormattedMessage
                  id="signIn.buttons.signIn"
                  defaultMessage="Sign In"
                />
              </Button>
              <Grid container>
                {!hideForgotPasswordLink && (
                  <Grid item xs>
                    <ChangeAuthStateLink
                      label={formatMessage({
                        id: "signIn.links.forgotPassword",
                        defaultMessage: "Reset password",
                      })}
                      newState="forgotPassword"
                      data-testid="forgot-password-link"
                    />
                  </Grid>
                )}
                {!hideSignUpLink && (
                  <Grid item>
                    <ChangeAuthStateLink
                      label={formatMessage({
                        id: "signIn.links.signUp",
                        defaultMessage: "Create account",
                      })}
                      newState="signUp"
                      data-testid="sign-up-link"
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Form>
        </FormSection>
      )}
    </Formik>
  );
};
