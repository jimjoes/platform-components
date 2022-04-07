import SignIn from "./src/pages/signIn";
import SignUp from "./src/pages/signUp";
import VerifyCode from "./src/pages/verify";
import RequestCode from "./src/pages/requestCode";
import ForgotPassword from "./src/pages/forgotPassword";
import Login from "./src/pages/login";
import AuthProvider, {
  AuthContext,
  AuthIsSignedIn,
  AuthIsNotSignedIn,
} from "./src/contexts/authContext";

/**
 * Export the components so that they are accessible via @custom-components/auth-flow
 */

export {
  AuthProvider,
  AuthContext,
  SignIn,
  SignUp,
  VerifyCode,
  RequestCode,
  ForgotPassword,
  Login,
  AuthIsSignedIn,
  AuthIsNotSignedIn,
};
