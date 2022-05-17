import invariant from "tiny-invariant";

import { Auth } from "@aws-amplify/auth";
import { ConsoleLogger as Logger } from "@aws-amplify/core";

import { useAuthContext } from "./use-auth-context";
import { useCheckContact } from "./use-check-contact";

const logger = new Logger("usePasswordlessSignIn");

export const usePasswordlessSignIn = (): ((
  username: string
) => Promise<void>) => {
  invariant(
    Auth && typeof Auth.signIn === "function",
    "No Auth module found, please ensure @aws-amplify/auth is imported"
  );

  const { handleStateChange } = useAuthContext();
  const checkContact = useCheckContact();

  return async (username: string): Promise<void> => {
    try {
      const user = await Auth.signIn(username);
      logger.debug(user);
      console.log("user: ", user);
      if (user.challengeName === "CUSTOM_CHALLENGE") {
        logger.debug("passwordless auth challenge " + user.challengeName);
        handleStateChange("passwordlessChallenge", user);
      } else {
        checkContact(user);
      }
    } catch (error) {
      if (error.code === "UserNotConfirmedException") {
        logger.debug("the user is not confirmed");
        handleStateChange("confirmSignUp", { username });
      } else if (error.code === "PasswordResetRequiredException") {
        logger.debug("the user requires a new password");
        handleStateChange("forgotPassword", { username });
      } else {
        logger.error(error);
        throw error;
      }
    }
  };
};
