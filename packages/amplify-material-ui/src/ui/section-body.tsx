import * as React from "react";
import { Box } from "@mui/material";

export type SectionBodyProps = {
  children: React.ReactNode;
  sx: any;
};

export const SectionBody: React.FC = ({ children }) => {
  return <Box>{children}</Box>;
};
