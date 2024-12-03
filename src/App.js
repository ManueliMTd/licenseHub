import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import LicenseManager from "./components/LicenseManager";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (token && Date.now() - token.timestamp < 3600000) {
      setIsLoggedIn(true);
    }
  }, []);

  return isLoggedIn ? <LicenseManager /> : <Login onLogin={setIsLoggedIn} />;
};

export default App;
