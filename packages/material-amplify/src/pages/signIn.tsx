import React, { useState, useContext } from "react";

import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import { useValidPassword, useValidUsername } from "../hooks/useAuthHooks";
import { Password, Username } from "../components/authComponents";

import { AuthContext } from "../contexts/authContext";

const SignIn: React.FunctionComponent<{}> = () => {
  const { username, setUsername, usernameIsValid } = useValidUsername("");
  const { password, setPassword, passwordIsValid } = useValidPassword("");
  const [error, setError] = useState("");

  const isValid =
    !usernameIsValid ||
    username.length === 0 ||
    !passwordIsValid ||
    password.length === 0;

  const navigate = useNavigate();

  const authContext = useContext(AuthContext);

  const signInClicked = async () => {
    try {
      await authContext.signInWithEmail(username, password);
      navigate("home");
    } catch (err: any) {
      if (err.code === "UserNotConfirmedException") {
        navigate("verify");
      } else {
        setError(err.message);
      }
    }
  };

  const passwordResetClicked = async () => {
    navigate("requestcode");
  };

  return (
    <Grid
      sx={{ height: "100vh" }}
      container
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
    >
      <Grid
        xs={11}
        sm={6}
        lg={4}
        container
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        item
      >
        <Paper style={{ width: "100%", padding: 32 }}>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            {/* Title */}
            <Box m={2}>
              <Typography variant="h3">Sign in</Typography>
            </Box>

            {/* Sign In Form */}
            <Box width="80%" m={1}>
              {/* <Email emailIsValid={emailIsValid} setEmail={setEmail} /> */}
              <Username
                usernameIsValid={usernameIsValid}
                setUsername={setUsername}
              />{" "}
            </Box>
            <Box width="80%" m={1}>
              <Password
                label="Password"
                passwordIsValid={passwordIsValid}
                setPassword={setPassword}
              />
              <Grid
                container
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
              >
                <Box onClick={passwordResetClicked} mt={2}>
                  <Typography
                    sx={{ "&:hover": { cursor: "pointer" } }}
                    variant="body2"
                  >
                    Forgot Password?
                  </Typography>
                </Box>
              </Grid>
            </Box>

            {/* Error */}
            <Box mt={2}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>

            {/* Buttons */}
            <Box mt={2}>
              <Grid container flexDirection="row" justifyContent="center">
                <Box m={1}>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </Box>
                <Box m={1}>
                  <Button
                    disabled={isValid}
                    color="primary"
                    variant="contained"
                    onClick={signInClicked}
                  >
                    Sign In
                  </Button>
                </Box>
              </Grid>
            </Box>
            <Box mt={2}>
              <Box onClick={() => navigate("signup")}>
                <Typography
                  sx={{ "&:hover": { cursor: "pointer" } }}
                  variant="body1"
                >
                  Register a new account
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SignIn;
