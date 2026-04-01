import { useState } from "react";
import AuthComponent from "./auth/AuthComponent";
import CylinderApp from "./cylinder/CylinderApp";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("access_token"));

  if (!loggedIn) {
    return <AuthComponent onAuthSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <CylinderApp
      onLogout={() => {
        localStorage.clear();
        setLoggedIn(false);
      }}
    />
  );
}
