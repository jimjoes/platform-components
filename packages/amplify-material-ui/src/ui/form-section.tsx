import * as React from "react";
import { Paper } from "@mui/material";

import { FormContainer } from "./form-container";

export const FormSection: React.FC = ({ children }) => {
  return (
    <FormContainer>
      <Paper
        sx={{
          mt: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: "300px",
          p: 2,
        }}
      >
        {children}
      </Paper>
    </FormContainer>
  );
};
