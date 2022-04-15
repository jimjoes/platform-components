import * as React from "react";
import { Box } from "@mui/material";

type SectionFooterProps = {
  children: React.ReactNode;
  sx?: any;
};

export const SectionFooter = ({ children, sx }: SectionFooterProps) => {
  return <Box sx={{ sx }}>{children}</Box>;
};
