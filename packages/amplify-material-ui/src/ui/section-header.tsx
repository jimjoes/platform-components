import * as React from "react";
import { Box, Typography } from "@mui/material";
import { LogoContainer } from "./logo-container";

export const SectionHeader: React.FC = ({ children }) => {
  return (
    <Box
      sx={{
        mt: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <LogoContainer />
      <Typography component="h1" variant="h6">
        {children}
      </Typography>
    </Box>
  );
};
