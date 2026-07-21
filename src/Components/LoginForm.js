import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../Style.css";

const TRADING_LOGIN_URL = "http://tradeplus.aionioncapital.com/";

const LoginForm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.location.replace(TRADING_LOGIN_URL);
  }, []);

  return (
    <div className='login-container'>
      <h2>Login</h2>
      <div className='login-form'>
        <p className='trading-login-helper'>
          Redirecting you to the TradePlus login portal.
        </p>

        <a className='trading-login-link' href={TRADING_LOGIN_URL}>
          Continue to Login
        </a>

        <p className='register-link'>
          Don't have an account?
          <span onClick={() => navigate("/numberregistration")}> Register</span>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
