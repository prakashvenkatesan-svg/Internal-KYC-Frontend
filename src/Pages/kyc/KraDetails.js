import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../../services/api";

const KraDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [xmlViewerOpen, setXmlViewerOpen] = useState(false);
  const [xmlLoading, setXmlLoading] = useState(false);
  const [xmlContent, setXmlContent] = useState("");
  const [xmlError, setXmlError] = useState("");
  const [xmlSource, setXmlSource] = useState("KRA");

  const panData = location.state?.panData;
  const applicationId = localStorage.getItem("application_id") || "";
  const fullAddress = [
    panData?.address_line_1,
    panData?.address_line_2,
    panData?.address_line_3,
    panData?.city,
    panData?.state,
    panData?.pincode,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(", ");

  const formattedKraXml = useMemo(() => {
    const value = String(panData?.kra_raw_xml || "").trim();
    if (!value) {
      return "";
    }

    return value
      .replace(/>\s*</g, "><")
      .replace(/(>)(<)(\/*)/g, "$1\n$2$3");
  }, [panData?.kra_raw_xml]);

  if (!panData) {
    return (
      <div className='container py-5 text-center'>
        <h4>No KRA data found</h4>

        <button
          className='btn btn-primary mt-3'
          onClick={() => navigate("/pancard-verification")}
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleNext = async () => {
    try {
      console.log("PAN DATA:", panData);
      const kraAddress = fullAddress;

      if (kraAddress) {
        localStorage.setItem("aadhaar_address_prefill", kraAddress);
        localStorage.setItem("aadhaar_address_prefill_source", "KRA");
      }

      await api.post("/identify/save-kra-details", {
        application_id: localStorage.getItem("application_id"),
        ...panData,
      });

      navigate("/bankproof");
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewXml = async () => {
    setXmlViewerOpen(true);
    setXmlError("");

    if (formattedKraXml) {
      setXmlSource("KRA");
      setXmlContent(formattedKraXml);
      return;
    }

    if (!applicationId) {
      setXmlContent("");
      setXmlError("Application ID not found.");
      return;
    }

    try {
      setXmlLoading(true);
      setXmlContent("");

      const response = await api.get(
        `/identify/applications/${applicationId}/source-xml`,
      );

      setXmlSource(response.data?.data?.source || "KRA");
      setXmlContent(response.data?.data?.xml || "");
    } catch (error) {
      setXmlContent("");
      setXmlError(error.response?.data?.message || "Unable to fetch KRA XML.");
    } finally {
      setXmlLoading(false);
    }
  };

  return (
    <div className='kra-page'>
      <div className='kra-card'>
        <div className='kra-header'>KRA Details</div>

        <div className='kra-body'>
          <div className='row g-4'>
            <div className='col-md-6'>
              <label className='kra-label'>PAN Number</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.pan || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>KRA Email</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.email || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>KRA Mobile</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.mobile || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>Gender</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.gender || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>Date of Birth</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.dob || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>Aadhaar Number</label>

              <input
                type='text'
                className='form-control kra-input'
                value={
                  panData.aadhaar_number
                    ? `XXXXXXXX${String(panData.aadhaar_number)
                        .replace(/\s/g, "")
                        .slice(-4)}`
                    : "XXXXXXXX0000"
                }
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>KRA Name</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.kra_name || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>Applicant Name</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.name || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>KRA Status</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.kra_status || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>Address Line 1</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.address_line_1 || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>Address Line 2</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.address_line_2 || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>Address Line 3</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.address_line_3 || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>City</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.city || panData.address_2 || ""}
                readOnly
              />
            </div>

            <div className='col-12'>
              <label className='kra-label'>Address Used for Application</label>

              <textarea
                className='form-control kra-input'
                value={fullAddress}
                rows={3}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>State</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.state || ""}
                readOnly
              />
            </div>

            <div className='col-md-6'>
              <label className='kra-label'>Pincode</label>

              <input
                type='text'
                className='form-control kra-input'
                value={panData.pincode || ""}
                readOnly
              />
            </div>
          </div>

          <div className='text-center mt-5'>
            <button
              className='kra-btn'
              onClick={handleViewXml}
              style={{
                marginRight: "12px",
                background: "#fff",
                color: "#264095",
                border: "1px solid #264095",
              }}
              type='button'
            >
              View XML
            </button>

            <button className='kra-btn' onClick={handleNext}>
              Next
            </button>
          </div>

          {xmlViewerOpen ? (
            <div className='modal-overlay'>
              <div className='modal-box' style={{ maxWidth: "900px" }}>
                <div className='modal-header'>
                  <h3>Source XML</h3>
                </div>

                <div className='modal-body'>
                  <p>
                    <strong>Source:</strong> {xmlSource || "KRA"}
                  </p>

                  {xmlLoading ? (
                    <p>Loading XML...</p>
                  ) : xmlError ? (
                    <p className='error-text'>{xmlError}</p>
                  ) : (
                    <pre
                      style={{
                        maxHeight: "420px",
                        overflow: "auto",
                        padding: "16px",
                        background: "#f7f9fc",
                        borderRadius: "12px",
                        border: "1px solid #dbe3ef",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        marginBottom: 0,
                      }}
                    >
                      {xmlContent ||
                        "XML not available for this verification source."}
                    </pre>
                  )}
                </div>

                <div className='modal-footer'>
                  <button
                    type='button'
                    className='close-btn'
                    onClick={() => setXmlViewerOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default KraDetails;
