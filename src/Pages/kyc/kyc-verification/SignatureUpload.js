import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";

import KycStepper from "../../../Components/kyc/KycStepper";

import signatureupload from "../../../assets/signatureupload.png";

const SignatureUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, JPEG, PNG and PDF files are allowed");
      setFile(null);
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2 MB

    if (selectedFile.size > maxSize) {
      setError("File size must be less than 2 MB");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        setError("Please select a file");
        return;
      }

      const formData = new FormData();
      formData.append("application_id", localStorage.getItem("application_id"));
      formData.append("signature", file);

      const response = await axios.post(
        "http://localhost:5000/api/signature/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        navigate("/esign");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to upload signature");
    }
  };

  return (
    <div className='container'>
      <KycStepper
        currentStep='complete'
        completedSteps={["contact", "identify", "personal", "scheme"]}
      />

      <div className='row'>
        <div className='col-lg-6'>
          <img
            src={signatureupload}
            alt='signature-upload'
            className='signatureuploadimg'
          />
        </div>

        <div className='col-lg-6'>
          <div className='esign-card'>
            <h4 className='text-center mb-4'>e-Sign Upload</h4>

            <div className='upload-box'>
              {error && <div className='alert alert-danger mb-3'>{error}</div>}

              {file && (
                <div className='alert alert-success mb-3'>{file.name}</div>
              )}

              <input
                type='file'
                id='signatureFile'
                accept='.jpg,.jpeg,.png,.pdf'
                hidden
                onChange={handleFileChange}
              />

              <label htmlFor='signatureFile' className='upload-label'>
                <p>
                  Choose a Signature File
                  <span className='text-danger'>*</span>
                </p>

                <small>JPG, PNG, PDF up to 2 MB</small>

                <div className='browse-btn'>Browse File</div>
              </label>
            </div>

            <button type='button' className='upload-btn' onClick={handleUpload}>
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureUpload;
