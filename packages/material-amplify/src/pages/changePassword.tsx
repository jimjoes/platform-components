import React, { useState, useContext } from "react";

import { useNavigate } from "react-router-dom";

import { Box, Grid, Button, Typography, Paper } from "@mui/material";

import { useValidPassword } from "../hooks/useAuthHooks";
import { Password } from "../components/authComponents";

import { AuthContext } from "../contexts/authContext";

export default function ChangePassword() {
  const [error, setError] = useState("");
  const [reset, setReset] = useState(false);

  const {
    password: oldPassword,
    setPassword: setOldPassword,
    passwordIsValid: oldPasswordIsValid,
  } = useValidPassword("");

  const {
    password: newPassword,
    setPassword: setNewPassword,
    passwordIsValid: newPasswordIsValid,
  } = useValidPassword("");

  const isValid =
    !oldPasswordIsValid ||
    oldPassword.length === 0 ||
    !newPasswordIsValid ||
    newPassword.length === 0;

  const navigate = useNavigate();

  const authContext = useContext(AuthContext);

  const changePassword = async () => {
    try {
      await authContext.changePassword(oldPassword, newPassword);
      setReset(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signOut = async () => {
    try {
      await authContext.signOut();
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const updatePassword = (
    <>
      <Box width="80%" m={1}>
        <Password
          label="Old Password"
          passwordIsValid={oldPasswordIsValid}
          setPassword={setOldPassword}
        />
      </Box>
      <Box width="80%" m={1}>
        <Password
          label="Password"
          passwordIsValid={newPasswordIsValid}
          setPassword={setNewPassword}
        />
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
              onClick={() => navigate(-1)}
              color="secondary"
              variant="contained"
            >
              Cancel
            </Button>
          </Box>
          <Box m={1}>
            <Button
              disabled={isValid}
              color="primary"
              variant="contained"
              onClick={changePassword}
            >
              Change Password
            </Button>
          </Box>
        </Grid>
      </Box>
    </>
  );

  const passwordReset = (
    <>
      <Typography variant="h5">{`Password Changed`}</Typography>

      <Box m={4}>
        <Button onClick={signOut} color="primary" variant="contained">
          Sign In
        </Button>
      </Box>
    </>
  );

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
        <Paper style={{ width: "100%", padding: 16 }}>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            {/* Title */}
            <Box m={3}>
              <Grid
                container
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
              >
                <Typography variant="h3">Change Password</Typography>
              </Grid>
            </Box>

            {!reset ? updatePassword : passwordReset}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}