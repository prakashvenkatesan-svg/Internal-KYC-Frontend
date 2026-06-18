import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import KycStepper from "../../../Components/kyc/KycStepper";
import signatureupload from "../../../assets/signatureupload.png";

const PanUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, JPEG, PNG and PDF files are allowed");
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2 MB");
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        setError("Please select a PAN card file");
        return;
      }

      const formData = new FormData();

      formData.append("application_id", localStorage.getItem("application_id"));

      formData.append("panCard", file);

      const response = await axios.post(
        "http://localhost:5000/api/pancard/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        navigate("/uploadsignature");
      }
    } catch (error) {
      console.error(error);
      setError("Upload failed");
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
            alt='pan-upload'
            className='signatureuploadimg'
          />
        </div>

        <div className='col-lg-6'>
          <div className='esign-card'>
            <h4 className='text-center mb-4'>PAN Card Upload</h4>

            {error && <div className='alert alert-danger mb-3'>{error}</div>}

            {file && (
              <div className='alert alert-success mb-3'>
                Selected File: {file.name}
              </div>
            )}

            <div className='upload-box'>
              <input
                type='file'
                id='panFile'
                accept='.jpg,.jpeg,.png,.pdf'
                hidden
                onChange={handleFileChange}
              />

              <label htmlFor='panFile' className='upload-label'>
                <p>
                  Choose PAN Card File
                  <span className='text-danger'> *</span>
                </p>

                <small>
                  Only JPG, JPEG, PNG, PDF files are allowed
                  <br />
                  Maximum size: 2 MB
                </small>

                <div className='browse-btn mt-3'>Browse File</div>
              </label>
            </div>

            <button
              type='button'
              className='upload-btn mt-3'
              onClick={handleUpload}
              disabled={!file}
            >
              Upload PAN Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanUpload;
