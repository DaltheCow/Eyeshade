import { Button } from "@mui/material";
import React, { Component } from "react";
import { render } from "react-dom";

const App = () => {
  return (
    <Button
      sx={{ width: "125px" }}
      size="small"
      variant="outlined"
      onClick={() => chrome.runtime.openOptionsPage()}
    >
      Open options
    </Button>
  );
};

render(<App />, document.getElementById("root"));
