import * as React from "react";
import { Box } from "@mui/material";

export const SectionFooter: React.FC = ({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx: any;
}) => {
  return <Box sx={{ sx }}>{children}</Box>;
};
