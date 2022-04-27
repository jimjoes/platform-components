import * as React from "react";
import { AuthProps } from "@jimjoes/amplify-auth-hooks";

import { Notification } from "../notification";
import { AuthProvider } from "./auth-provider";
import { ForgotPassword } from "./forgot-password";
import { Greetings } from "./greetings";
import { Loading } from "./loading";
import { SignIn } from "./sign-in";
import { SignInPasswordless } from "./sign-in-passwordless";
import { SignUp } from "./sign-up";
import { RequireNewPassword } from "./require-new-password";
import { ConfirmSignIn } from "./confirm-sign-in";
import { ConfirmSignUp } from "./confirm-sign-up";
import { VerifyContact } from "./verify-contact";
import { AuthRoute, AuthConfig } from "./auth-route";

export interface AuthRouterProps extends AuthProps, AuthConfig {
  passwordless?: boolean;
  hide?: React.FC[];
  initialAuthState?: any;
  onStateChange?: any;
}

export const AuthRouter: React.FC<AuthRouterProps> = (props) => {
  const {
    passwordless = false,
    hide = [],
    children,
    initialAuthState,
    onStateChange,
    ...authConfig
  } = props;

  const defaultChildren = [
    {
      validAuthStates: ["*"],
      component: Notification,
    },
    {
      validAuthStates: ["loading"],
      component: Loading,
    },
    {
      validAuthStates: ["forgotPassword"],
      component: ForgotPassword,
    },
    {
      validAuthStates: ["signIn", "signedOut", "signedUp"],
      component: passwordless ? SignInPasswordless : SignIn,
    },
    {
      validAuthStates: ["signedIn"],
      component: Greetings,
    },
    {
      validAuthStates: ["signUp"],
      component: SignUp,
    },
    {
      validAuthStates: ["requireNewPassword"],
      component: RequireNewPassword,
    },
    {
      validAuthStates: ["verifyContact"],
      component: VerifyContact,
    },
    {
      validAuthStates: ["confirmSignIn"],
      component: ConfirmSignIn,
    },
    {
      validAuthStates: ["confirmSignUp"],
      component: ConfirmSignUp,
    },
  ];

  const renderChildren = defaultChildren
    .filter((item) => !hide.includes(item.component))
    .map((item, index) => (
      <AuthRoute
        key={`amplify-material-ui-authenticator-default-children-${index}`}
        {...item}
        {...authConfig}
      />
    ));
  return (
    <AuthProvider
      initialAuthState={initialAuthState}
      onStateChange={onStateChange}
    >
      {renderChildren}
      {children}
    </AuthProvider>
  );
};
