import { ThemeProvider, useTheme } from "bold-ui";
import React from "react";
import { Home } from "./components/Home";
const App: React.FC = () => {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <Home />
    </ThemeProvider>
  );
};

export default App;
