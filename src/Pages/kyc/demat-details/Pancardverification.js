import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../../../services/api";

import Pancard from "../../../assets/Pancard.png";
import exclamatory from "../../../assets/exclamatory.png";

import KycStepper from "../../../Components/kyc/KycStepper";
import KycInfoSection from "../../../Components/kyc/KycInfoSection";

const Pancardverification = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  const [applicationId, setApplicationId] = useState("");
  const [showExistingPopup, setShowExistingPopup] = useState(false);
const [existingClientCode, setExistingClientCode] = useState("");


  const [formData, setFormData] = useState({
    pan_number: "",
    dob: "",
    terms_accepted: false,
  });

  const [errors, setErrors] = useState({
    pan_number: "",
    dob: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);
  const [panResult, setPanResult] = useState(null);

  useEffect(() => {
    const savedApplicationId = localStorage.getItem("application_id");

    if (!savedApplicationId) {
      setErrors((prev) => ({
        ...prev,
        general:
          "Application not found. Please complete mobile/email step first.",
      }));
      navigate("/numberregistration");
      return;
    }

    setApplicationId(savedApplicationId);
  }, [navigate]);

  const handlePanChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      pan_number: value,
    }));

    setErrors((prev) => ({
      ...prev,
      pan_number: "",
      general: "",
    }));
  };

  const handleDobChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      dob: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      dob: "",
      general: "",
    }));
  };
const handleExistingPopupClose = () => {
    setShowExistingPopup(false);
    navigate("/");
  };
  const validateForm = () => {
    const newErrors = {
      pan_number: "",
      dob: "",
      general: "",
    };

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!formData.pan_number.trim()) {
      newErrors.pan_number = "PAN number is required";
    } else if (!panRegex.test(formData.pan_number)) {
      newErrors.pan_number = "Enter a valid PAN number";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();

      if (Number.isNaN(dobDate.getTime())) {
        newErrors.dob = "Enter a valid date of birth";
      } else if (dobDate > today) {
        newErrors.dob = "Date of birth cannot be in the future";
      }
    }

    if (!applicationId) {
      newErrors.general =
        "Application ID missing. Please complete registration first.";
    }

    setErrors(newErrors);

    return !newErrors.pan_number && !newErrors.dob && !newErrors.general;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const cleanedPan = formData.pan_number.trim().toUpperCase();
      localStorage.setItem("panNumber", cleanedPan);

      const response = await api.post("/identify/verify-pan", {
        application_id: localStorage.getItem("application_id"),

        pan_number: cleanedPan,

        dob: formData.dob,
      });

      const result = response.data;
      console.log("VERIFY PAN RESPONSE:", result);
      console.log("CLIENT CODE:", result.clientCode);

      if (result?.application_id) {
        localStorage.setItem("application_id", String(result.application_id));
      }

      if (!result?.success) {
        setErrors({
          general: result?.message || "PAN verification failed",
        });

        return;
      }

      // if (result?.accountExists) {
      //   setErrors({
      //     general: result?.message || "You already have an account",
      //   });

      //   return;
      // }

      if (result?.accountExists) {
        setExistingClientCode(result.clientCode);
        setShowExistingPopup(true);
        return;
      }

      if (result?.isKraRegistered) {
        navigate("/kra-details", {
          state: {
            panData: result.data,
          },
        });

        return;
      }

      if (result?.incomeTaxVerified) {
        console.log("NAVIGATING TO INCOME PAGE");
        navigate("/income-details", {
          state: {
            incomeTaxData: result.data,

            pan_number: cleanedPan,

            dob: formData.dob,
          },
        });

        return;
      }
    } catch (error) {
      console.log("VERIFY PAN ERROR:", error.response?.data || error.message);

      setErrors({
        general: error.response?.data?.message || "PAN verification failed",
      });
    } finally {
      setLoading(false);
    }
  };



  const handleContinue = () => {
    navigate("/bankdetails");
  };

  return (
    <div className='container'>
      <KycStepper currentStep='identify' completedSteps={["contact"]} />

      <div className='row'>
        <div className='col-lg-6 pancard-left'>
          <div className='pan-card'>
            <p className='text-format'>1. Kindly input your :</p>
            <ul>
              <li>PAN Number as in PAN Card</li>
              <li>Date of Birth as in PAN Card</li>
            </ul>
            <p className='text-format'>
              2. The Account Name will be recorded in accordance with the
              details provided in the Income Tax Database.
            </p>
            <p className='text-format'>
              3. In compliance with the latest PMLA regulations, please verify
              that your Aadhaar Number is correctly linked to your PAN.
            </p>

            <img src={Pancard} alt='Pancard' className='pancardimg' />
          </div>
        </div>

        <div className='col-lg-6 forms-card'>
          <div className='register-card'>
            <div className='logo-section'>
              <h2 className='text-center'>PAN Verification</h2>
              <p className='text-center'>
                Your name will be taken as per ITD (Income Tax Department)
              </p>
            </div>

            <div className='input-container'>
              <input
                type='text'
                name='pan_number'
                className='input-field'
                placeholder='PAN Number'
                value={formData.pan_number}
                onChange={handlePanChange}
                maxLength='10'
              />
              <label className='floating-label'>
                Enter your PAN Number <span>*</span>
              </label>
              {errors.pan_number && (
                <p className='error-text'>{errors.pan_number}</p>
              )}
            </div>

            <div className='input-container'>
              <label>
                Date of Birth <span className='required'>*</span>
              </label>
              <div className='date-input-container'>
                <input
                  type='date'
                  className='date-input'
                  value={formData.dob}
                  onChange={handleDobChange}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              {errors.dob && <p className='error-text'>{errors.dob}</p>}
            </div>

            {errors.general && <p className='error-text'>{errors.general}</p>}

            <div className='d-flex checkbox-content'>
              <input
                type='checkbox'
                id='terms'
                name='terms_accepted'
                className='checkbox'
                checked={formData.terms_accepted}
                onChange={handleChange}
              />

              <div className='terms-wrapper'>
                <label htmlFor='terms'>
                  I Consent to{" "}
                  <span className='terms-text'>KYC Terms and Conditions* </span>
                </label>

                <div className='terms-popup'>
                  <p>
                    I/We hereby declare that the KYC details furnished by me are
                    true and correct to the best of my/our knowledge and belief
                    and I/we undertake to inform you of any changes therein,
                    immediately. In case any of the above information is found
                    to be false or untrue or misleading or misrepresenting, I
                    am/We are aware that I/We may be held liable for it. I/We
                    hereby consent to receiving information from CVL KRA and
                    C-KYC registry through SMS/Email on the above registered
                    number/Email address. I am/We are also aware that for
                    Aadhaar OVD based KYC, my KYC request shall be validated
                    against Aadhaar details. I/We hereby consent to sharing
                    my/our masked Aadhaar card with readable QR code or my
                    Aadhaar XML/Digilocker XML file, along with passcode and as
                    applicable, with KRA and other Intermediaries with whom I
                    have a business relationship for KYC purposes only.
                  </p>
                </div>
              </div>
            </div>

            {errors.terms_accepted && (
              <p className='error-text'>{errors.terms_accepted}</p>
            )}

            <button
              type='button'
              className='submit-btn'
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Submit"}
            </button>

            {panResult && (
              <div className='mt-3 pan-result-card'>
                <h5>Your PAN is verified</h5>

                <p>
                  <strong>Full Name:</strong>{" "}
                  {panResult.full_name || "Not available"}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {panResult.category || "Not available"}
                </p>

                {panResult.aadhaar_seeding_status && (
                  <p>
                    <strong>Aadhaar Seeding Status:</strong>{" "}
                    {panResult.aadhaar_seeding_status}
                  </p>
                )}

                <button
                  type='button'
                  className='submit-btn mt-2'
                  onClick={handleContinue}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
{showExistingPopup && (
        <div className='popup-overlay'>
          <div className='popup-card'>
            <button className='popup-close' onClick={handleExistingPopupClose}>
              ×
            </button>

            <h4>Account Already Exists</h4>

            <p>You already have an account with Aionion Capital.</p>

            <p>
              <strong>Client Code:</strong> {existingClientCode}
            </p>

            <p>Please contact your RM.</p>

            <button
              className='btn btn-primary'
              onClick={handleExistingPopupClose}
            >
              OK
            </button>
          </div>
        </div>
      )}
      <KycInfoSection />
    </div>
  );
};

export default Pancardverification;
