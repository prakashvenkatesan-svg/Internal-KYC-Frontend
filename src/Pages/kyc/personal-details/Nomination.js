import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import KycStepper from "../../../Components/kyc/KycStepper";
import api from "../../../services/api";

const Nomination = () => {
  const navigate = useNavigate();

  const [nomination, setNomination] = useState("Yes");
  const [selectedDoc, setSelectedDoc] = useState("");
  const [applicationId, setApplicationId] = useState("");

  const [rightsAccepted, setRightsAccepted] = useState(false);

  const [showNomineeNames, setShowNomineeNames] = useState(false);
  const [showNomineeYesNo, setShowNomineeYesNo] = useState(false);
  const [personalAddress, setPersonalAddress] = useState("");

  const [aadhaarFocused, setAadhaarFocused] = useState(false);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nomineeName: "",
    dob: "",
    mobile: "",
    email: "",
    relation: "",
    gender: "",
    nomineeProofType: "",
    aadhaar: "",
    pan: "",
    nomineeAddress: "",
    sameAddress: false,
  });

  useEffect(() => {
    const savedApplicationId = localStorage.getItem("application_id");

    if (!savedApplicationId) {
      navigate("/numberregistration");
      return;
    }

    setApplicationId(savedApplicationId);
  }, [navigate]);

  useEffect(() => {
    const savedAddress = localStorage.getItem("aadhaarAddress") || "";
    setPersonalAddress(savedAddress);
  }, []);

  const maskAadhaarNumber = (value = "") => {
    if (!value) return "";

    const cleanValue = value.replace(/\D/g, "").slice(0, 12);

    if (cleanValue.length <= 4) {
      return cleanValue;
    }

    return "XXXXXXXX" + cleanValue.slice(-4);
  };

  const handleNominationChange = (value) => {
    setNomination(value);

    if (value === "No") {
      navigate("/no-nomination");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let updatedValue = type === "checkbox" ? checked : value;

    if (name === "nomineeName") {
      updatedValue = value.replace(/[^A-Za-z\s.]/g, "");
    }

    if (name === "mobile") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "aadhaar") {
      updatedValue = value.replace(/\D/g, "").slice(0, 12);
    }

    if (name === "pan") {
      updatedValue = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10);
    }

    if (name === "sameAddress") {
      const savedAddress =
        personalAddress || localStorage.getItem("aadhaarAddress") || "";

      if (checked && !savedAddress.trim()) {
        setFormData((prev) => ({
          ...prev,
          sameAddress: false,
          nomineeAddress: "",
        }));

        setErrors((prev) => ({
          ...prev,
          nomineeAddress:
            "Personal address not found. Please enter nominee address manually.",
        }));

        return;
      }

      setFormData((prev) => ({
        ...prev,
        sameAddress: checked,
        nomineeAddress: checked ? savedAddress : "",
      }));

      setErrors((prev) => ({
        ...prev,
        nomineeAddress: "",
        general: "",
      }));

      return;
    }
  };

  const handleDocChange = (e) => {
    const value = e.target.value;

    setSelectedDoc(value);

    setFormData((prev) => ({
      ...prev,
      nomineeProofType: value,
      aadhaar: "",
      pan: "",
    }));

    setErrors((prev) => ({
      ...prev,
      nomineeProofType: "",
      aadhaar: "",
      pan: "",
      general: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s.]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!formData.nomineeName.trim()) {
      newErrors.nomineeName = "Nominee name is required";
    } else if (!nameRegex.test(formData.nomineeName.trim())) {
      newErrors.nomineeName = "Only letters are allowed";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    }

    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (formData.mobile.length !== 10) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.relation) {
      newErrors.relation = "Relation is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.nomineeProofType) {
      newErrors.nomineeProofType = "Please select nominee proof type";
    }

    if (formData.nomineeProofType === "Aadhaar") {
      if (!formData.aadhaar) {
        newErrors.aadhaar = "Aadhaar number is required";
      } else if (formData.aadhaar.length !== 12) {
        newErrors.aadhaar = "Aadhaar number must be 12 digits";
      }
    }

    if (formData.nomineeProofType === "PAN") {
      if (!formData.pan) {
        newErrors.pan = "PAN number is required";
      } else if (!panRegex.test(formData.pan)) {
        newErrors.pan = "Enter valid PAN number";
      }
    }

    if (!formData.nomineeAddress.trim()) {
      newErrors.nomineeAddress = "Address is required";
    }

    if (!rightsAccepted) {
      newErrors.rightsAccepted = "Please accept rights and obligations";
    }

    if (!applicationId) {
      newErrors.general = "Application ID missing";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await api.post("/nominees/save", {
        application_id: Number(applicationId),
        ...formData,
      });

      if (response.data?.success) {
        navigate("/percentage-allocation");
      } else {
        setErrors((prev) => ({
          ...prev,
          general: response.data?.message || "Failed to save nominee",
        }));
      }
    } catch (error) {
      console.log("NOMINEE SAVE ERROR:", error.response?.data || error.message);

      setErrors((prev) => ({
        ...prev,
        general:
          error.response?.data?.message || "Failed to save nominee details",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container'>
      <KycStepper
        currentStep='personal'
        completedSteps={["contact", "identify"]}
      />

      <div className='Nomination-card'>
        <div className='d-flex gap-3 align-items-center mb-4 nominee-heading'>
          <p className='mb-0 nominee-title'>
            Add Nominee Details <span className='required'>*</span>
          </p>

          <div className='d-flex nomination-btn gap-3 align-items-center'>
            <div className='d-flex align-items-center'>
              <input
                type='radio'
                id='yes'
                name='nomination'
                value='Yes'
                checked={nomination === "Yes"}
                onChange={() => handleNominationChange("Yes")}
              />
              <label htmlFor='yes' className='ms-1 mb-0'>
                Yes
              </label>
            </div>

            <div className='d-flex align-items-center'>
              <input
                type='radio'
                id='no'
                name='nomination'
                value='No'
                checked={nomination === "No"}
                onChange={() => handleNominationChange("No")}
              />
              <label htmlFor='no' className='ms-1 mb-0'>
                No
              </label>
            </div>
          </div>
        </div>

        {nomination === "Yes" && (
          <form onSubmit={handleSubmit}>
            <div className='row'>
              <div className='col-lg-6'>
                <div className='input-container'>
                  <input
                    type='text'
                    className='input-field'
                    placeholder='Nominee Name'
                    name='nomineeName'
                    value={formData.nomineeName}
                    onChange={handleChange}
                  />
                  <label className='floating-label'>
                    Enter your Nominee Name <span>*</span>
                  </label>
                </div>
                {errors.nomineeName && (
                  <p className='error-text'>{errors.nomineeName}</p>
                )}
              </div>

              <div className='col-lg-6'>
                <div className='input-container'>
                  <div className='date-input-container'>
                    <input
                      type='date'
                      className='date-input'
                      name='dob'
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                {errors.dob && <p className='error-text'>{errors.dob}</p>}
              </div>

              <div className='col-lg-6'>
                <div className='input-container'>
                  <input
                    type='text'
                    className='input-field'
                    placeholder='Enter your Mobile number'
                    name='mobile'
                    value={formData.mobile}
                    onChange={handleChange}
                    inputMode='numeric'
                    autoComplete='off'
                  />
                  <label className='floating-label'>
                    Enter your Mobile Number <span>*</span>
                  </label>
                </div>
                {errors.mobile && <p className='error-text'>{errors.mobile}</p>}
              </div>

              <div className='col-lg-6'>
                <div className='input-container'>
                  <input
                    type='text'
                    className='input-field'
                    placeholder='Enter your mail ID'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete='off'
                  />
                  <label className='floating-label'>
                    Enter your Mail ID <span>*</span>
                  </label>
                </div>
                {errors.email && <p className='error-text'>{errors.email}</p>}
              </div>

              <div className='col-lg-6'>
                <div className='floating-group'>
                  <select
                    name='relation'
                    className='floating-select'
                    value={formData.relation}
                    onChange={handleChange}
                  >
                    <option value='' disabled hidden>
                      Select Relation
                    </option>
                    <option value='Father'>Father</option>
                    <option value='Mother'>Mother</option>
                    <option value='Brother'>Brother</option>
                    <option value='Sister'>Sister</option>
                    <option value='Spouse'>Spouse</option>
                    <option value='Son'>Son</option>
                    <option value='Daughter'>Daughter</option>
                    <option value='Other'>Other</option>
                  </select>
                  <label>
                    Relation to you <span>*</span>
                  </label>
                </div>
                {errors.relation && (
                  <p className='error-text'>{errors.relation}</p>
                )}
              </div>

              <div className='col-lg-6'>
                <div className='floating-group'>
                  <select
                    name='gender'
                    className='floating-select'
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value='' disabled hidden>
                      Select Gender
                    </option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                  </select>
                  <label>
                    Select Gender <span>*</span>
                  </label>
                </div>
                {errors.gender && <p className='error-text'>{errors.gender}</p>}
              </div>
            </div>

            <div className='d-flex gap-3 mt-3 align-items-center flex-wrap'>
              <p className='mb-0'>
                Select Nominee Proof Type <span className='required'>*</span>
              </p>

              <div className='d-flex nomination-btn gap-3'>
                <div className='d-flex align-items-center'>
                  <input
                    type='radio'
                    name='document'
                    value='Aadhaar'
                    checked={selectedDoc === "Aadhaar"}
                    onChange={handleDocChange}
                  />
                  <label className='ms-1'>Aadhaar Card</label>
                </div>

                <div className='d-flex align-items-center'>
                  <input
                    type='radio'
                    name='document'
                    value='PAN'
                    checked={selectedDoc === "PAN"}
                    onChange={handleDocChange}
                  />
                  <label className='ms-1'>PAN Card</label>
                </div>
              </div>
            </div>

            {errors.nomineeProofType && (
              <p className='error-text'>{errors.nomineeProofType}</p>
            )}

            <div className='mt-3 col-12 col-md-6'>
              {selectedDoc === "Aadhaar" && (
                <>
                  <div className='floating-group'>
                    <input
                      type='text'
                      name='aadhaar'
                      className='floating-input'
                      placeholder='Enter Aadhaar Number'
                      value={
                        aadhaarFocused
                          ? formData.aadhaar
                          : maskAadhaarNumber(formData.aadhaar)
                      }
                      onFocus={() => setAadhaarFocused(true)}
                      onBlur={() => setAadhaarFocused(false)}
                      onChange={handleChange}
                      inputMode='numeric'
                      autoComplete='off'
                      onPaste={(e) => e.preventDefault()}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                    />
                    <label>
                      Aadhaar Number <span>*</span>
                    </label>
                  </div>
                  {errors.aadhaar && (
                    <p className='error-text'>{errors.aadhaar}</p>
                  )}
                </>
              )}

              {selectedDoc === "PAN" && (
                <>
                  <div className='floating-group'>
                    <input
                      type='text'
                      name='pan'
                      className='floating-input'
                      placeholder='Enter PAN Number'
                      value={formData.pan}
                      onChange={handleChange}
                      autoComplete='off'
                    />
                    <label>
                      PAN Number <span>*</span>
                    </label>
                  </div>
                  {errors.pan && <p className='error-text'>{errors.pan}</p>}
                </>
              )}
            </div>

            <div className='d-flex justify-content-between mt-4 align-items-center flex-wrap'>
              <p className='mb-0'>Nominee Address Details</p>

              <div className='same-address-wrapper'>
                <input
                  type='checkbox'
                  id='sameAddress'
                  className='same-address-checkbox'
                  name='sameAddress'
                  checked={formData.sameAddress}
                  onChange={handleChange}
                />

                <label htmlFor='sameAddress' className='same-address-label'>
                  Same as my address
                </label>
              </div>
            </div>

            <div className='col-12 col-md-6 mt-4'>
              <div className='floating-group mt-3'>
                <textarea
                  name='nomineeAddress'
                  className='floating-textarea'
                  rows='4'
                  placeholder=' '
                  value={formData.nomineeAddress}
                  onChange={handleChange}
                  readOnly={formData.sameAddress}
                />

                <label>
                  Address Details <span>*</span>
                </label>
              </div>

              {errors.nomineeAddress && (
                <p className='error-text'>{errors.nomineeAddress}</p>
              )}
            </div>

            <p className='mt-4'>
              <span className='required'>*</span>I / We want the Details of my /
              our nominee to be printed in the statement of holding, provided to
              me / us by the AMC / DP as follows ; (Please tick, as Appropriate)
            </p>

            <div className='d-flex align-items-center gap-4 flex-wrap'>
              <div className='d-flex align-items-center gap-2'>
                <input
                  type='checkbox'
                  id='nomineeName'
                  className='nominee-box'
                  checked={showNomineeNames}
                  onChange={(e) => setShowNomineeNames(e.target.checked)}
                />
                <label htmlFor='nomineeName' className='mb-0'>
                  Name of Nominee(s)
                </label>
              </div>

              <div className='d-flex align-items-center gap-2'>
                <input
                  type='checkbox'
                  id='nomineeYesNo'
                  className='nominee-box'
                  checked={showNomineeYesNo}
                  onChange={(e) => setShowNomineeYesNo(e.target.checked)}
                />
                <label htmlFor='nomineeYesNo' className='mb-0'>
                  Nominee : Yes/No
                </label>
              </div>
            </div>

            <p className='investor-nominee-info'>
              Rights, Entitlement, Obligations Investor and Nominee
            </p>

            <div className='d-flex gap-3'>
              <input
                type='checkbox'
                id='terms'
                name='terms_accepted'
                className='checkbox'
                checked={rightsAccepted}
                onChange={(e) => {
                  setRightsAccepted(e.target.checked);
                  setErrors((prev) => ({
                    ...prev,
                    rightsAccepted: "",
                    general: "",
                  }));
                }}
              />
              <label htmlFor='terms'>
                I further confirm having read and understood the contents of the
                “Rights and Obligations” document(s) and “Risk Disclosure
                Document” MITC. I / We do hereby agree to be bound by such
                provisions as outlined in these documents.
              </label>
            </div>

            {errors.rightsAccepted && (
              <p className='error-text mt-3'>{errors.rightsAccepted}</p>
            )}

            {errors.general && (
              <p className='error-text mt-3'>{errors.general}</p>
            )}

            <button type='submit' className='mt-4' disabled={loading}>
              {loading ? "Saving..." : "Submit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Nomination;
