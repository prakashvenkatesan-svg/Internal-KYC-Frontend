import React from "react";

import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";

import Aionionlogo from "../assets/Aionionlogo.png";
import rekycLinks from "../utils/rekycLinks";

const Rekycform = () => {
  const navigate = useNavigate();

  return (
    <div className='Form-container'>
      <div className='Form-card rekyc-card'>
        <button
          type='button'
          className='back-btn rekyc-back-btn'
          onClick={() => navigate("/investor")}
        >
          <IoArrowBack style={{ marginRight: "3px", color: "#000000" }} />
          Back
        </button>

        <div className='logo-container'>
          <img src={Aionionlogo} alt='Logo' className='navbar-logo' />
        </div>
        <div className='logo-section'>
          <h2>AIONION CAPITAL MARKET SERVICES PVT. LTD.</h2>
          <p className='rekyc-helper-text'>
            Select the ReKYC process you want to continue with.
          </p>
        </div>

        <div className='rekyc-link-list'>
          {rekycLinks.map((item) => (
            <a
              className='rekyc-process-link'
              href={item.href}
              target='_blank'
              rel='noopener noreferrer'
              key={item.label}
            >
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              <IoArrowForward aria-hidden='true' />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rekycform;
