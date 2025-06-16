import React from "react";
import { LoginController } from "./login.control";
import LoginComponent from "./Login.component";

const Login = () => {
  return (
    <>
      <LoginController>
        <LoginComponent />
      </LoginController>
    </>
  );
};

export default Login;
