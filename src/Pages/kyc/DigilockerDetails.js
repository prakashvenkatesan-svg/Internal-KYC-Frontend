import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../../services/api";

import digilocker from "../../assets/digilocker.png";
import Aadhaarcard from "../../assets/Aadhaarcard.png";
import correct from "../../assets/correct.png";
import verification from "../../assets/verification.png";

const DigilockerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [xmlModalOpen, setXmlModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const formatSourcePayload = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch (_) {
        return value;
      }
    }

    return JSON.stringify(value, null, 2);
  };

  const fallbackJsonMessage =
    "DigiLocker XML was not returned by the provider for this application. Showing DigiLocker provider response JSON instead.";

  const initialRawXml = location.state?.digilockerXml || "";
  const initialProviderJson = location.state?.digilockerSourceData || null;

  const [xmlContent, setXmlContent] = useState(
    initialRawXml || formatSourcePayload(initialProviderJson),
  );
  const [xmlSource, setXmlSource] = useState(
    initialRawXml
      ? "DIGILOCKER XML"
      : initialProviderJson
        ? "DIGILOCKER Provider Response (JSON)"
        : "Unavailable",
  );
  const [xmlMessage, setXmlMessage] = useState(
    !initialRawXml && initialProviderJson ? fallbackJsonMessage : "",
  );
  const [xmlLoading, setXmlLoading] = useState(false);
  const [xmlError, setXmlError] = useState("");

  const data = location.state?.digilockerData;
  console.log("DIGILOCKER DATA:", data);

  if (!data) {
    return (
      <div className='container py-5 text-center'>
        <h4>No DigiLocker data found</h4>
      </div>
    );
  }

  const maskedAadhaar = data?.maskedNumber || "";
  const address = data?.address || {};

  const fullAddress = `
  ${address.house || ""}
  ${address.street || ""}
  ${address.landmark || ""}
  ${address.district || ""}
  ${address.state || ""}
  ${address.country || ""}
  ${address.pin || ""}
`
    .replace(/\s+/g, " ")
    .trim();
  const addressLine1 = [address.house, address.street, address.landmark]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(", ");
  const addressLine2 = [address.district, address.city]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(", ");

  const rawCareOf = data?.address?.careOf || "";

  const fatherName = rawCareOf
    .replace(/^(S\/O|D\/O|C\/O|W\/O)\s*:?\s*/i, "")
    .trim();

  const photoUrl = data?.photo ? `data:image/jpeg;base64,${data.photo}` : "";


  const isXmlBackedSummary = Boolean(initialRawXml);
  const summaryDocumentType = isXmlBackedSummary
    ? "e-Aadhaar generated from DigiLocker verified Aadhaar XML"
    : "DigiLocker verified Aadhaar details";
  const summaryDescription = isXmlBackedSummary
    ? "This document is generated from verified Aadhaar XML obtained from DigiLocker with due user consent and authentication."
    : "This document is generated from DigiLocker provider response data with due user consent and authentication.";
  const summaryGeneratedAt = new Date().toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const summaryValue = (value) => {
    const nextValue = String(value || "").trim();
    return nextValue || "-";
  };

  const escapeHtml = (value) =>
    summaryValue(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const careOfLabel = rawCareOf.match(/^(S\/O|D\/O|C\/O|W\/O)/i)?.[1] || "C/O, S/O, D/O";
  const summaryCellStyle = {
    border: "1px solid #111",
    padding: "8px 10px",
    verticalAlign: "top",
  };
  const summaryLabelStyle = {
    ...summaryCellStyle,
    width: "28%",
    fontWeight: 600,
  };

  const handlePrintAadhaarSummary = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      return;
    }

    const photoHtml = photoUrl
      ? `<img src="${photoUrl}" alt="Aadhaar Photo" style="width:120px;max-height:150px;object-fit:cover;border:1px solid #111;" />`
      : `<div style="width:120px;height:150px;border:1px solid #111;display:flex;align-items:center;justify-content:center;margin:0 auto;">No Photo</div>`;

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>DigiLocker Aadhaar Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #111; }
            h2 { text-align: center; margin: 0 0 6px; font-size: 18px; }
            .subtitle { text-align: center; font-size: 11px; margin: 0 0 18px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            td { border: 1px solid #111; padding: 8px 10px; vertical-align: top; }
            .label { width: 28%; font-weight: 600; }
            .photo { text-align: center; width: 24%; }
            .footer { text-align: center; margin-top: 12px; font-size: 12px; }
            .confidential { color: #d00; letter-spacing: 1px; }
            @media print { body { padding: 10mm; } }
          </style>
        </head>
        <body>
          <h2>DigiLocker verified e-Aadhaar</h2>
          <p class="subtitle">${escapeHtml(summaryDescription)}</p>
          <table>
            <tbody>
              <tr><td class="label">Document type</td><td colspan="2">${escapeHtml(summaryDocumentType)}</td></tr>
              <tr><td class="label">Generation date</td><td>${escapeHtml(summaryGeneratedAt)}</td><td>Download date&nbsp;&nbsp; ${escapeHtml(summaryGeneratedAt)}</td></tr>
              <tr><td class="label">Masked Aadhaar number</td><td colspan="2">${escapeHtml(maskedAadhaar)}</td></tr>
              <tr><td class="label">Name</td><td>${escapeHtml(data?.name)}</td><td rowspan="6" class="photo"><strong>Photo</strong><br/><br/>${photoHtml}</td></tr>
              <tr><td class="label">Date of Birth</td><td>${escapeHtml(data?.dateOfBirth)}</td></tr>
              <tr><td class="label">Gender</td><td>${escapeHtml(data?.gender)}</td></tr>
              <tr><td class="label">${escapeHtml(careOfLabel)}</td><td>${escapeHtml(fatherName)}</td></tr>
              <tr><td class="label">Address</td><td>${escapeHtml(fullAddress)}</td></tr>
              <tr><td class="label">Landmark</td><td>${escapeHtml(address.landmark)}</td></tr>
              <tr><td class="label">City/District</td><td>${escapeHtml(address.district || address.city)}</td><td></td></tr>
              <tr><td class="label">Pin code</td><td>${escapeHtml(address.pin)}</td><td>State&nbsp;&nbsp; ${escapeHtml(address.state)}</td></tr>
            </tbody>
          </table>
          <div class="footer">For Limited Circulation | <span class="confidential">CONFIDENTIAL</span></div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const renderAadhaarSummary = () => (
    <div
      style={{
        background: "#fff",
        color: "#111",
        fontFamily: "Arial, sans-serif",
        padding: "8px",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          margin: "0 0 6px",
          fontSize: "18px",
          color: "#111",
        }}
      >
        DigiLocker verified e-Aadhaar
      </h3>
      <p
        style={{
          textAlign: "center",
          margin: "0 0 16px",
          fontSize: "11px",
          fontWeight: 600,
          color: "#111",
        }}
      >
        {summaryDescription}
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "13px",
        }}
      >
        <tbody>
          <tr>
            <td style={summaryLabelStyle}>Document type</td>
            <td style={summaryCellStyle} colSpan='2'>
              {summaryDocumentType}
            </td>
          </tr>
          <tr>
            <td style={summaryLabelStyle}>Generation date</td>
            <td style={summaryCellStyle}>{summaryGeneratedAt}</td>
            <td style={summaryCellStyle}>Download date&nbsp;&nbsp; {summaryGeneratedAt}</td>
          </tr>
          <tr>
            <td style={summaryLabelStyle}>Masked Aadhaar number</td>
            <td style={summaryCellStyle} colSpan='2'>
              {summaryValue(maskedAadhaar)}
            </td>
          </tr>
          <tr>
            <td style={summaryLabelStyle}>Name</td>
            <td style={summaryCellStyle}>{summaryValue(data?.name)}</td>
            <td
              style={{
                ...summaryCellStyle,
                width: "24%",
                textAlign: "center",
              }}
              rowSpan='6'
            >
              <strong>Photo</strong>
              <div style={{ marginTop: "12px" }}>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt='Aadhaar Profile'
                    style={{
                      width: "120px",
                      maxHeight: "150px",
                      objectFit: "cover",
                      border: "1px solid #111",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "120px",
                      height: "150px",
                      border: "1px solid #111",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                    }}
                  >
                    No Photo
                  </div>
                )}
              </div>
            </td>
          </tr>
          <tr>
            <td style={summaryLabelStyle}>Date of Birth</td>
            <td style={summaryCellStyle}>{summaryValue(data?.dateOfBirth)}</td>
          </tr>
          <tr>
            <td style={summaryLabelStyle}>Gender</td>
            <td style={summaryCellStyle}>{summaryValue(data?.gender)}</td>
          </tr>
          <tr>
            <td style={summaryLabelStyle}>{careOfLabel}</td>
            <td style={summaryCellStyle}>{summaryValue(fatherName)}</td>
          </tr>
          <tr>
            <td style={summaryLabelStyle}>Address</td>
            <td style={summaryCellStyle}>{summaryValue(fullAddress)}</td>
          </tr>
          <tr>
            <td style={summaryLabelStyle}>Landmark</td>
            <td style={summaryCellStyle}>{summaryValue(address.landmark)}</td>
          </tr>
          <tr>
            <td style={summaryLabelStyle}>City/District</td>
            <td style={summaryCellStyle}>{summaryValue(address.district || address.city)}</td>
            <td style={summaryCellStyle}></td>
          </tr>
          <tr>
            <td style={summaryLabelStyle}>Pin code</td>
            <td style={summaryCellStyle}>{summaryValue(address.pin)}</td>
            <td style={summaryCellStyle}>State&nbsp;&nbsp; {summaryValue(address.state)}</td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          textAlign: "center",
          marginTop: "12px",
          fontSize: "12px",
          color: "#111",
        }}
      >
        For Limited Circulation | <span style={{ color: "#d00" }}>CONFIDENTIAL</span>
      </div>
    </div>
  );

  const handleViewXml = async () => {
    if (xmlContent) {
      setXmlError("");
      setXmlModalOpen(true);
      return;
    }

    try {
      setXmlLoading(true);
      setXmlError("");

      const applicationId = localStorage.getItem("application_id");
      const response = await api.get(
        `/identify/applications/${applicationId}/digilocker-source`,
      );

      const { sourceType, message, data: sourceData } = response.data || {};

      setXmlMessage(message || "");

      if (sourceType === "xml") {
        setXmlSource("DIGILOCKER XML");
        setXmlContent(sourceData || "");
      } else if (sourceType === "json") {
        setXmlSource("DIGILOCKER Provider Response (JSON)");
        setXmlContent(formatSourcePayload(sourceData));
      } else {
        setXmlSource("Unavailable");
        setXmlContent("");
        setXmlError(
          message || "No DigiLocker XML or provider response found for this application.",
        );
      }

      setXmlModalOpen(true);
    } catch (error) {
      setXmlError(
        error.response?.data?.message || "Failed to fetch source XML",
      );
      setXmlModalOpen(true);
    } finally {
      setXmlLoading(false);
    }
  };

  const handleProceed = async () => {
    try {
      localStorage.setItem("aadhaar_address_prefill", fullAddress);
      localStorage.setItem("aadhaar_address_prefill_source", "DIGILOCKER");

      const payload = {
        application_id: localStorage.getItem("application_id"),

        aadhaar_number_masked: maskedAadhaar,

        name: data?.name,

        father_name: fatherName,

        gender: data?.gender,

        dob: data?.dateOfBirth,

        address: `
        ${address.house || ""}
        ${address.street || ""}
        ${address.landmark || ""}
        ${address.district || ""}
        ${address.state || ""}
        ${address.country || ""}
        ${address.pin || ""}
      `
          .replace(/\s+/g, " ")
          .trim(),

        address_1: addressLine1,

        address_2: addressLine2,

        state: address.state || "",

        pincode: address.pin || "",

        photo_base64: photoUrl,

        provider: "digilocker",

        provider_ref: localStorage.getItem("digilocker_id"),

        digilocker_raw_xml: location.state?.digilockerXml || "",

        digilocker_provider_response:
          location.state?.digilockerSourceData || data || null,
      };

      console.log("SAVE PAYLOAD:", payload);

      await api.post("/identify/save-details", payload);
      console.log("Data saved successfully");

      navigate("/bankproof", {
        state: {
          customerData: {
            ...data,
          },
        },
      });
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-lg-6'>
          <div className='digilocker-card'>
            <img src={digilocker} alt='digilocker' className='digilockerimg' />

            <img
              src={Aadhaarcard}
              alt='Aadhaarcard'
              className='Aadhaarcardimg'
            />

            <div className='d-flex gap-2'>
              <img src={correct} alt='correct' className='correctimg' />
              <p>Identity Verified Successfully.</p>
            </div>

            <div className='d-flex gap-2'>
              <img src={correct} alt='correct' className='correctimg' />
              <p>
                Your details have been fetched Successfully from your official
                digilocker account
              </p>
            </div>

            <div className='verificationcard d-flex gap-2'>
              <img
                src={verification}
                alt='verification'
                className='verificationimg'
              />
              <p>Government Backed Verification</p>
            </div>
          </div>
        </div>

        <div className='col-lg-6'>
          <div className='digilocker-result-card'>
            <h3 className='digilocker-title'>Confirm your Details</h3>

            <p className='digilocker-subtitle'>
              Please verify the details fetched via DigiLocker
            </p>

            <div className='profile-photo-wrap'>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt='Aadhaar Profile'
                  className='profile-photo'
                />
              ) : (
                <div className='profile-photo no-photo'>No Photo</div>
              )}
            </div>

            <div className='details-form'>
              <div className='input-box input-box-full'>
                <label>
                  Aadhaar Number <span>*</span>
                </label>
                <input type='text' value={maskedAadhaar} readOnly />
              </div>

              <div className='input-box'>
                <label>
                  Full Name <span>*</span>
                </label>
                <input type='text' value={data?.name || ""} readOnly />
              </div>

              <div className='input-box'>
                <label>
                  Father's Name <span>*</span>
                </label>
                <input type='text' value={fatherName || ""} readOnly />
              </div>

              <div className='input-box'>
                <label>
                  DOB <span>*</span>
                </label>
                <input type='text' value={data?.dateOfBirth || ""} readOnly />
              </div>

              <div className='input-box'>
                <label>
                  Gender <span>*</span>
                </label>
                <input type='text' value={data?.gender || ""} readOnly />
              </div>

              <div className='input-box input-box-full address-box'>
                <label>
                  Address <span>*</span>
                </label>
                <textarea value={fullAddress} readOnly />
              </div>
            </div>

            <div className='confirm-btn-wrap'>
              <button
                className='confirm-btn'
                type='button'
                onClick={handleViewXml}
                style={{
                  marginRight: "12px",
                  background: "#fff",
                  color: "#264095",
                  border: "1px solid #264095",
                }}
                disabled={xmlLoading}
              >
                {xmlLoading ? "Loading Source..." : "View Source XML"}
              </button>
              <button
                className='confirm-btn'
                type='button'
                onClick={() => setSummaryModalOpen(true)}
                style={{
                  marginRight: "12px",
                  background: "#fff",
                  color: "#264095",
                  border: "1px solid #264095",
                }}
              >
                View Aadhaar Summary
              </button>
              <button className='confirm-btn' onClick={handleProceed}>
                Confirm & Proceed <span>-></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {summaryModalOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 1050,
          }}
        >
          <div
            style={{
              width: "min(900px, 100%)",
              maxHeight: "85vh",
              background: "#fff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 18px 50px rgba(0, 0, 0, 0.18)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ color: "#264095", margin: 0 }}>
                  Aadhaar Summary
                </h3>
                <p style={{ margin: "6px 0 0", color: "#264095" }}>
                  {isXmlBackedSummary
                    ? "Generated from DigiLocker XML"
                    : "Generated from DigiLocker provider response data"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type='button'
                  className='confirm-btn'
                  onClick={handlePrintAadhaarSummary}
                  style={{
                    background: "#fff",
                    color: "#264095",
                    border: "1px solid #264095",
                  }}
                >
                  Print / Save PDF
                </button>
                <button
                  type='button'
                  className='confirm-btn'
                  onClick={() => setSummaryModalOpen(false)}
                  style={{
                    background: "#fff",
                    color: "#264095",
                    border: "1px solid #264095",
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            <div style={{ overflow: "auto" }}>{renderAadhaarSummary()}</div>
          </div>
        </div>
      ) : null}

      {xmlModalOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 1050,
          }}
        >
          <div
            style={{
              width: "min(900px, 100%)",
              maxHeight: "85vh",
              background: "#fff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 18px 50px rgba(0, 0, 0, 0.18)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ color: "#264095", margin: 0 }}>
                  {xmlSource?.includes("JSON") ? "DigiLocker Source JSON" : "Source XML"}
                </h3>
                <p style={{ margin: "6px 0 0", color: "#264095" }}>
                  Source: {xmlSource}
                </p>
              </div>
              <button
                type='button'
                className='confirm-btn'
                onClick={() => setXmlModalOpen(false)}
                style={{
                  background: "#fff",
                  color: "#264095",
                  border: "1px solid #264095",
                }}
              >
                Close
              </button>
            </div>

            {xmlMessage ? (
              <p style={{ color: "#c53030", marginBottom: "12px" }}>
                {xmlMessage}
              </p>
            ) : null}

            {xmlError ? (
              <p style={{ color: "#c53030", margin: 0 }}>{xmlError}</p>
            ) : (
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  overflow: "auto",
                  background: "#f8faff",
                  border: "1px solid #d7defe",
                  borderRadius: "12px",
                  padding: "16px",
                  color: "#183153",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {xmlContent || "No DigiLocker XML or provider response found for this application."}
              </pre>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DigilockerDetails;
