import React, { useState } from "react";
import { Avatar, Box } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export const LogoContainer = () => {
  const [showLogo, setShowLogo] = useState<boolean>(true);
  return (
    <Box sx={{ m: 2 }}>
      {showLogo ? (
        <img
          width="200px"
          src="/logo.svg"
          onError={() => {
            setShowLogo(false);
          }}
          alt="logo"
        />
      ) : (
        <Avatar sx={{ bgColor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
      )}
    </Box>
  );
};
