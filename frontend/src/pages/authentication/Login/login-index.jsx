import React from "react";
import Login from "./Login";
import { LoginController } from "./login.control";

const LoginComponent = () => {
  return (
    <>
      <LoginController>
        <Login />
      </LoginController>
    </>
  );
};

export default LoginComponent;
