import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import KycStepper from "../../../Components/kyc/KycStepper";
import api from "../../../services/api";

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 30;
const PROVIDER_PENDING_STATUSES = new Set([
  "sign_in_progress",
  "sign_pending",
  "sign_initiated",
  "pending",
  "in_progress",
]);

const buildPendingProviderMessage = (providerStatus) =>
  `The eSign provider has not finalized this request yet${providerStatus ? ` (${providerStatus})` : ""}. Please wait 30-60 seconds, then use Check Status again. If the OTP page showed "transaction not allowed", this usually means the provider or ESP has not completed the transaction on their side yet.`;

const SignatureVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfMessage, setPdfMessage] = useState("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [esignStatus, setEsignStatus] = useState("");
  const [providerStatus, setProviderStatus] = useState("");
  const [signedPdfUrl, setSignedPdfUrl] = useState("");
  const [ddpiDetails, setDdpiDetails] = useState(null);
  const [ddpiLoading, setDdpiLoading] = useState(false);
  const [xmlModalOpen, setXmlModalOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState("");
  const [xmlSource, setXmlSource] = useState("Unavailable");
  const [xmlLoading, setXmlLoading] = useState(false);
  const [xmlError, setXmlError] = useState("");
  const [xmlMessage, setXmlMessage] = useState("");
  const [aadhaarSummaryOpen, setAadhaarSummaryOpen] = useState(false);
const [aadhaarSummaryLoading, setAadhaarSummaryLoading] = useState(false);
const [aadhaarSummaryError, setAadhaarSummaryError] = useState("");
const [aadhaarSummaryData, setAadhaarSummaryData] = useState(null);
  const [applicationId, setApplicationId] = useState(
    () =>
      searchParams.get("application_id") ||
      localStorage.getItem("application_id") ||
      "",
  );
  const hasReturnFromEsign = searchParams.get("esign_return") === "1";
  const isCompleted = esignStatus === "completed" && Boolean(signedPdfUrl);
  const isCheckingReturnedEsign = hasReturnFromEsign && !isCompleted;
  const assetBaseUrl = useMemo(
    () => String(api.defaults.baseURL || "").replace(/\/api\/?$/, ""),
    [],
  );
  const ddpiImageUrl = ddpiDetails?.image_url
    ? `${assetBaseUrl}${ddpiDetails.image_url}`
    : ddpiDetails?.image_path
      ? `${assetBaseUrl}/${String(ddpiDetails.image_path).replace(/^\/+/, "")}`
      : "";
  const hasAssignedStampPaper = Boolean(
    ddpiDetails?.ddpi_selected ||
      ddpiDetails?.stamp_paper_id ||
      ddpiDetails?.stamp_number ||
      ddpiDetails?.image_url ||
      ddpiDetails?.image_path,
  );

  useEffect(() => {
    const nextApplicationId =
      searchParams.get("application_id") ||
      localStorage.getItem("application_id") ||
      "";

    setApplicationId(nextApplicationId);
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        window.URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  useEffect(() => {
    if (!applicationId) {
      return;
    }

    let cancelled = false;

    const loadDdpiDetails = async () => {
      try {
        setDdpiLoading(true);
        const response = await api.get(`/ddpi/applications/${applicationId}`);
        if (!cancelled) {
          setDdpiDetails(response.data?.data || null);
        }
      } catch (error) {
        if (!cancelled) {
          setDdpiDetails(null);
        }
      } finally {
        if (!cancelled) {
          setDdpiLoading(false);
        }
      }
    };

    loadDdpiDetails();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  useEffect(() => {
    if (!applicationId || !hasReturnFromEsign) {
      return undefined;
    }

    let pollAttempts = 0;
    let pollTimer = null;
    let stopped = false;

    const stopPolling = () => {
      stopped = true;
      if (pollTimer) {
        window.clearTimeout(pollTimer);
      }
    };

    const checkEsignStatus = async () => {
      try {
        setStatusLoading(true);
        if (pollAttempts === 0) {
          setMessage("Checking eSign status...");
        }

        const response = await api.get(
          `/esign/applications/${applicationId}/status`,
        );
        const data = response.data?.data || {};
        const nextEsignStatus = data.esign_status || "";
        const nextProviderStatus = data.provider_status || "";

        setEsignStatus(nextEsignStatus);
        setProviderStatus(nextProviderStatus);

        if (nextProviderStatus === "sign_complete") {
          localStorage.setItem("esign_completed", "true");
          setSignedPdfUrl(
            `${api.defaults.baseURL}/esign/applications/${applicationId}/signed-pdf`,
          );
          setMessage(
            "eSign completed successfully. Download the signed PDF or continue.",
          );
          stopPolling();
          return;
        }

        if (nextEsignStatus === "pending") {
          pollAttempts += 1;
          setMessage(buildPendingProviderMessage(nextProviderStatus));

          if (pollAttempts < MAX_POLL_ATTEMPTS && !stopped) {
            pollTimer = window.setTimeout(checkEsignStatus, POLL_INTERVAL_MS);
            return;
          }

          setMessage(buildPendingProviderMessage(nextProviderStatus));
          stopPolling();
          return;
        }

        setMessage(
          data.provider_response?.message ||
            "eSign is not completed yet. Please retry after signing.",
        );
        stopPolling();
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Unable to check the eSign status right now.",
        );
        stopPolling();
      } finally {
        setStatusLoading(false);
      }
    };

    checkEsignStatus();

    return () => {
      stopPolling();
    };
  }, [applicationId, hasReturnFromEsign]);

  const getPdfResponse = async () => {
    if (!applicationId) {
      setPdfMessage(
        "Application ID not found. Please resume the application again.",
      );
      return null;
    }

    try {
      setPdfLoading(true);
      setPdfMessage("");

      const response = await api.get(
        `/contact/applications/${applicationId}/pdf`,
        {
          responseType: "blob",
        },
      );

      const contentDisposition = response.headers["content-disposition"] || "";
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const fileName =
        fileNameMatch?.[1] || `account_opening_${applicationId}.pdf`;
      const blob = new Blob([response.data], { type: "application/pdf" });

      if (response.headers["x-pdf-warnings"]) {
        setPdfMessage(
          "Preview PDF is ready. Some production fields are still missing, so this copy should be used only for localhost/UAT review.",
        );
      }

      return { blob, fileName };
    } catch (error) {
      setPdfMessage(
        error.response?.data?.message ||
          "Unable to generate the PDF preview right now.",
      );
      return null;
    } finally {
      setPdfLoading(false);
    }
  };

  const previewPdf = async () => {
    const pdfResult = await getPdfResponse();
    if (!pdfResult) {
      return;
    }

    const previewUrl = window.URL.createObjectURL(pdfResult.blob);

    if (pdfPreviewUrl) {
      window.URL.revokeObjectURL(pdfPreviewUrl);
    }

    setPdfPreviewUrl(previewUrl);
    setPdfMessage(
      "Review the full PDF below, then confirm and proceed to eSign.",
    );
  };

  const downloadPdf = async () => {
    const pdfResult = await getPdfResponse();
    if (!pdfResult) {
      return;
    }

    const downloadUrl = window.URL.createObjectURL(pdfResult.blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = pdfResult.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    setPdfMessage((prev) =>
      prev && prev.includes("localhost/UAT")
        ? prev
        : "PDF downloaded successfully.",
    );
  };

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

const handleViewSourceXml = async () => {
  if (!applicationId) {
    setXmlMessage("");
    setXmlError("Application ID not found.");
    setXmlContent("");
    setXmlSource("Unavailable");
    setXmlModalOpen(true);
    return;
  }

  try {
    setXmlLoading(true);
    setXmlError("");
    setXmlMessage("");

    const response = await api.get(
      `/identify/applications/${applicationId}/digilocker-source`,
    );

    const { sourceType, message, data: sourceData } = response.data || {};

    if (sourceType === "xml") {
      setXmlSource("DIGILOCKER XML");
      setXmlContent(sourceData || "");
      setXmlMessage("");
      setXmlError("");
    } else if (sourceType === "json") {
      setXmlSource("DIGILOCKER Provider Response (JSON)");
      setXmlContent(formatSourcePayload(sourceData));
      setXmlMessage(
        message ||
          "DigiLocker XML was not returned by the provider for this application. Showing DigiLocker provider response JSON instead.",
      );
      setXmlError("");
    } else {
      setXmlSource("Unavailable");
      setXmlContent("");
      setXmlMessage("");
      setXmlError(
        message ||
          "No DigiLocker XML or provider response found for this application.",
      );
    }

    setXmlModalOpen(true);
  } catch (error) {
    setXmlSource("Unavailable");
    setXmlContent("");
    setXmlMessage("");
    setXmlError(
      error.response?.data?.message || "Failed to fetch DigiLocker source",
    );
    setXmlModalOpen(true);
  } finally {
    setXmlLoading(false);
  }
};
const getNestedValue = (obj, keys) => {
  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
};

const parseAddressParts = (addressText = "") => {
  const cleanAddress = String(addressText || "")
    .replace(/\s+/g, " ")
    .trim();

  const pincodeMatch = cleanAddress.match(/\b\d{6}\b/);
  const pincode = pincodeMatch ? pincodeMatch[0] : "";

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Puducherry",
  ];

  const state =
    indianStates.find((item) =>
      cleanAddress.toLowerCase().includes(item.toLowerCase()),
    ) || "";

  let cityDistrict = "";

  if (state) {
    const beforeState = cleanAddress
      .replace(new RegExp(`\\b${pincode}\\b`, "i"), "")
      .replace(/\bIndia\b/i, "")
      .split(new RegExp(state, "i"))[0]
      .trim();

    const words = beforeState.split(" ").filter(Boolean);
    cityDistrict = words.length ? words[words.length - 1] : "";
  }

  return {
    cityDistrict,
    state,
    pincode,
  };
};


const buildAadhaarSummary = (sourceData) => {
  const data = sourceData?.data || sourceData?.aadhaar || sourceData?.aadhaar_data || sourceData || {};
  const address = data?.address || data?.addressDetails || {};

  const fullAddress =
    getNestedValue(data, ["fullAddress", "address", "address_text"]) ||
    [
      address.house,
      address.street,
      address.landmark,
      address.locality,
      address.vtc,
      address.district,
      address.state,
      address.country,
      address.pin || address.pincode,
    ]
      .filter(Boolean)
      .join(", ");
      const parsedAddress = parseAddressParts(fullAddress);

  return {
    documentType:
      "DigiLocker verified Aadhaar details generated from provider response data",
    generationDate: new Date().toLocaleString("en-IN"),
    downloadDate: new Date().toLocaleString("en-IN"),
    maskedAadhaar: getNestedValue(data, [
      "maskedNumber",
      "maskedAadhaar",
      "aadhaar_number_masked",
      "masked_aadhaar",
      "uid",
    ]),
    name: getNestedValue(data, ["name", "fullName", "full_name"]),
    dob: getNestedValue(data, ["dateOfBirth", "dob", "date_of_birth"]),
    gender: getNestedValue(data, ["gender"]),
    careOf: getNestedValue(data, [
      "careOf",
      "care_of",
      "father_name",
      "address.careOf",
      "address.co",
    ]),
    address: fullAddress,
    landmark: getNestedValue(data, ["address.landmark", "landmark"]),
  cityDistrict:
  getNestedValue(data, [
    "address.district",
    "district",
    "address.city",
    "city",
  ]) || parsedAddress.cityDistrict,

pincode:
  getNestedValue(data, [
    "address.pin",
    "address.pincode",
    "pin",
    "pincode",
  ]) || parsedAddress.pincode,

state:
  getNestedValue(data, ["address.state", "state"]) ||
  parsedAddress.state,
    photo: getNestedValue(data, ["photo", "photo_base64", "image"]),
  };
};

const handleViewAadhaarSummary = async () => {
  if (!applicationId) {
    setAadhaarSummaryError("Application ID not found.");
    setAadhaarSummaryOpen(true);
    return;
  }

  try {
    setAadhaarSummaryLoading(true);
    setAadhaarSummaryError("");

 const response = await api.get(
  `/identify/applications/${applicationId}/digilocker-summary`,
);

const sourceData = response.data?.data || {};
const summary = buildAadhaarSummary({
  maskedNumber: sourceData.aadhaar_number_masked,
  name: sourceData.name,
  dateOfBirth: sourceData.dob,
  gender: sourceData.gender,
  father_name: sourceData.father_name,
  address: sourceData.address,
  photo: sourceData.photo_base64,
  provider: sourceData.provider,
  provider_ref: sourceData.provider_ref,
  raw: sourceData.digilocker_provider_response,
});

    setAadhaarSummaryData(summary);
    setAadhaarSummaryOpen(true);
  } catch (error) {
    setAadhaarSummaryError(
      error.response?.data?.message || "Failed to fetch Aadhaar summary.",
    );
    setAadhaarSummaryOpen(true);
  } finally {
    setAadhaarSummaryLoading(false);
  }
};
  const handleStartEsign = async () => {
    try {
      setLoading(true);
      setMessage("");
      setSignedPdfUrl("");
      setEsignStatus("");
      setProviderStatus("");

      if (!applicationId) {
        setMessage(
          "Application ID not found. Please resume the application again.",
        );
        return;
      }

      const response = await api.post(
        `/esign/applications/${applicationId}/start`,
      );
      const signerUrl =
        response.data?.data?.signer_url ||
        response.data?.data?.signing_url ||
        "";

      if (signerUrl) {
        window.location.assign(signerUrl);
        return;
      }

      setMessage(
        "eSign request was created, but no signer URL was returned. Please check the backend provider response.",
      );
    } catch (error) {
      const errorData = error.response?.data || {};
      const apiMessage = errorData?.message || "";
      const providerDetail =
        errorData?.provider_payload?.error?.detail ||
        errorData?.provider_payload?.message ||
        "";

      setMessage(
        apiMessage ||
          providerDetail ||
          "Unable to start the eSign flow right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!applicationId) {
      setMessage(
        "Application ID not found. Please resume the application again.",
      );
      return;
    }

    try {
      setStatusLoading(true);
      setMessage("Refreshing eSign status...");

      const response = await api.get(
        `/esign/applications/${applicationId}/status`,
      );
      const data = response.data?.data || {};
      const nextEsignStatus = data.esign_status || "";
      const nextProviderStatus = data.provider_status || "";

      setEsignStatus(nextEsignStatus);
      setProviderStatus(nextProviderStatus);

      if (nextProviderStatus === "sign_complete") {
        localStorage.setItem("esign_completed", "true");
        setSignedPdfUrl(
          `${api.defaults.baseURL}/esign/applications/${applicationId}/signed-pdf`,
        );
        setMessage(
          "eSign completed successfully. Download the signed PDF or continue.",
        );
        return;
      }

      if (
        nextEsignStatus === "pending" ||
        PROVIDER_PENDING_STATUSES.has(nextProviderStatus)
      ) {
        setMessage(buildPendingProviderMessage(nextProviderStatus));
        return;
      }

      setMessage(
        data.provider_response?.message ||
          "eSign is still pending. Please finish signing and check again.",
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to check the eSign status right now.",
      );
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (!applicationId || hasReturnFromEsign || isCompleted) {
      return;
    }

    previewPdf();
  }, [applicationId, hasReturnFromEsign, isCompleted]);

  return (
    <div className='container'>
      <KycStepper
        currentStep='complete'
        completedSteps={["contact", "identify", "personal", "scheme"]}
      />

      <div className=''>
        <p>
          Review your generated application PDF below, then proceed to the final
          eSign step to complete onboarding.
        </p>

        {hasAssignedStampPaper ? (
          <div
            style={{
              marginTop: "24px",
              border: "1px solid #d7defe",
              borderRadius: "20px",
              background: "#f8faff",
              padding: "20px",
            }}
          >
            <h4 style={{ color: "#264095", marginBottom: "8px" }}>
              DDPI Stamp Paper Review
            </h4>
            <p style={{ marginBottom: "8px" }}>
              <strong>Stamp paper assigned successfully.</strong>
            </p>
            {ddpiDetails.stamp_number ? (
              <p style={{ marginBottom: "12px" }}>
                Stamp Number: <strong>{ddpiDetails.stamp_number}</strong>
              </p>
            ) : null}
            <p style={{ marginBottom: "16px" }}>
              This stamp paper will be attached to your DDPI document for
              eSign.
            </p>
            {ddpiLoading ? (
              <p style={{ color: "#264095", marginBottom: 0 }}>
                Loading assigned stamp paper...
              </p>
            ) : ddpiImageUrl ? (
              <img
                src={ddpiImageUrl}
                alt={ddpiDetails.stamp_number || "Assigned stamp paper"}
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  borderRadius: "12px",
                  border: "1px solid #d7defe",
                  background: "#fff",
                }}
              />
            ) : (
              <p style={{ color: "#264095", marginBottom: 0 }}>
                Stamp paper is assigned, but no preview image is available yet.
              </p>
            )}
          </div>
        ) : null}

        {pdfMessage ? (
          <p className='mt-3' style={{ color: "#264095" }}>
            {pdfMessage}
          </p>
        ) : null}

        {message ? (
          <p className='mt-3' style={{ color: "#264095" }}>
            {message}
          </p>
        ) : null}

        {providerStatus ? (
          <p className='mt-2' style={{ color: "#264095" }}>
            Setu status: <strong>{providerStatus}</strong>
          </p>
        ) : null}

        {!isCompleted && !hasReturnFromEsign ? (
          <>
            <div
              style={{
                marginTop: "24px",
                border: "1px solid #d7defe",
                borderRadius: "20px",
                background: "#f8faff",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #d7defe",
                  color: "#264095",
                  fontWeight: 600,
                }}
              >
                Application PDF Review
              </div>

              <div
                style={{
                  height: "70vh",
                  minHeight: "540px",
                  background: "#eef3ff",
                }}
              >
                {pdfPreviewUrl ? (
                  <iframe
                    title='Application PDF Preview'
                    src={pdfPreviewUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "0",
                      background: "#fff",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#264095",
                      padding: "24px",
                      textAlign: "center",
                    }}
                  >
                    {pdfLoading
                      ? "Preparing PDF preview..."
                      : "PDF preview will appear here."}
                  </div>
                )}
              </div>
            </div>

            <button
              type='button'
              className='submit-btn'
              style={{
                marginTop: "16px",
                background: "#fff",
                color: "#264095",
                border: "1px solid #264095",
              }}
              onClick={previewPdf}
              disabled={
                pdfLoading || loading || statusLoading || !applicationId
              }
            >
              {pdfLoading ? "Preparing PDF..." : "Refresh PDF Preview"}
            </button>

            <button
              type='button'
              className='submit-btn'
              style={{
                marginTop: "16px",
                background: "#fff",
                color: "#264095",
                border: "1px solid #264095",
              }}
              onClick={downloadPdf}
              disabled={
                pdfLoading || loading || statusLoading || !applicationId
              }
            >
              {pdfLoading ? "Preparing PDF..." : "Download PDF"}
            </button>

            <button
              type='button'
              className='submit-btn'
              style={{
                marginTop: "16px",
                background: "#fff",
                color: "#264095",
                border: "1px solid #264095",
              }}
              onClick={handleViewSourceXml}
              disabled={xmlLoading || loading || statusLoading || pdfLoading}
            >
              {xmlLoading ? "Loading XML..." : "View Source XML"}
            </button>
<button
  type='button'
  className='submit-btn'
  style={{
    marginTop: "16px",
    background: "#fff",
    color: "#264095",
    border: "1px solid #264095",
  }}
  onClick={handleViewAadhaarSummary}
  disabled={
    aadhaarSummaryLoading || loading || statusLoading || pdfLoading
  }
>
  {aadhaarSummaryLoading ? "Loading Summary..." : "View Aadhaar Summary"}
</button>
            <button
              type='button'
              className='submit-btn'
              style={{
                marginTop: "16px",
              }}
              onClick={handleStartEsign}
              disabled={loading || statusLoading || pdfLoading}
            >
              {loading ? "Preparing eSign..." : "Confirm and Proceed to eSign"}
            </button>

            <button
              type='button'
              className='submit-btn'
              style={{
                marginTop: "16px",
                background: "#fff",
                color: "#264095",
                border: "1px solid #264095",
              }}
              onClick={handleCheckStatus}
              disabled={
                loading || statusLoading || pdfLoading || !applicationId
              }
            >
              {statusLoading ? "Checking Status..." : "Check Status"}
            </button>
          </>
        ) : null}

        {isCheckingReturnedEsign ? (
          <>
            <div
              style={{
                marginTop: "24px",
                border: "1px solid #d7defe",
                borderRadius: "20px",
                background: "#f8faff",
                padding: "28px 24px",
                color: "#264095",
                textAlign: "center",
              }}
            >
              {statusLoading
                ? "Checking eSign completion status..."
                : "Waiting for the latest eSign status update from Setu."}
            </div>

            <button
              type='button'
              className='submit-btn'
              style={{
                marginTop: "16px",
                background: "#fff",
                color: "#264095",
                border: "1px solid #264095",
              }}
              onClick={handleCheckStatus}
              disabled={
                loading || statusLoading || pdfLoading || !applicationId
              }
            >
              {statusLoading ? "Checking Status..." : "Check Status"}
            </button>
          </>
        ) : isCompleted ? (
          <>
            <a
              href={signedPdfUrl}
              className='submit-btn'
              style={{
                display: "inline-block",
                marginTop: "16px",
                textDecoration: "none",
                textAlign: "center",
              }}
              target='_blank'
              rel='noreferrer'
            >
              Download Signed PDF
            </a>

            <button
              type='button'
              className='submit-btn'
              style={{ marginTop: "16px" }}
              onClick={() => navigate("/kyc-complete")}
            >
              Continue to KYC Complete
            </button>
          </>
        ) : null}

        <button
          type='button'
          className='submit-btn'
          style={{
            marginTop: "16px",
            background: "#fff",
            color: "#264095",
            border: "1px solid #264095",
          }}
          onClick={() => navigate("/photoverify")}
          disabled={loading || statusLoading || pdfLoading}
        >
          Back
        </button>

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
                  <h3 style={{ color: "#264095", margin: 0 }}>Source XML</h3>
                  <p style={{ margin: "6px 0 0", color: "#264095" }}>
                    Source: {xmlSource}
                  </p>
                </div>
                <button
                  type='button'
                  className='submit-btn'
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

{xmlError && !xmlContent ? (
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
      minHeight: "180px",
      maxHeight: "50vh",
    }}
  >
    {xmlContent ||
      "No DigiLocker XML or provider response found for this application."}
  </pre>
)}
            </div>
          </div>



               ) : null}

        {aadhaarSummaryOpen ? (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              zIndex: 1060,
            }}
          >
            <div
              style={{
                width: "min(900px, 100%)",
                maxHeight: "90vh",
                background: "#fff",
                borderRadius: "16px",
                padding: "24px",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <h3 style={{ color: "#264095", margin: 0 }}>
                  DigiLocker verified Aadhaar details
                </h3>

                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => setAadhaarSummaryOpen(false)}
                  style={{
                    background: "#fff",
                    color: "#264095",
                    border: "1px solid #264095",
                  }}
                >
                  Close
                </button>
              </div>

              {aadhaarSummaryError ? (
                <p style={{ color: "#c53030" }}>{aadhaarSummaryError}</p>
              ) : (
                <div id="aadhaar-summary-print">
                  <p style={{ textAlign: "center", fontWeight: 700 }}>
                    DigiLocker verified Aadhaar details
                  </p>

                  <p style={{ textAlign: "center", fontSize: "12px" }}>
                    This document is generated from DigiLocker provider response data.
                  </p>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: "16px",
                      fontSize: "14px",
                    }}
                  >
                    <tbody>
                      {[
                        ["Document type", aadhaarSummaryData?.documentType],
                        ["Generation date", aadhaarSummaryData?.generationDate],
                        ["Download date", aadhaarSummaryData?.downloadDate],
                        ["Masked Aadhaar number", aadhaarSummaryData?.maskedAadhaar],
                        ["Name", aadhaarSummaryData?.name],
                        ["Date of Birth", aadhaarSummaryData?.dob],
                        ["Gender", aadhaarSummaryData?.gender],
                        ["C/O, S/O, D/O", aadhaarSummaryData?.careOf],
                        ["Address", aadhaarSummaryData?.address],
                        ["Landmark", aadhaarSummaryData?.landmark],
                        ["City/District", aadhaarSummaryData?.cityDistrict],
                        ["Pin code", aadhaarSummaryData?.pincode],
                        ["State", aadhaarSummaryData?.state],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <td
                            style={{
                              border: "1px solid #111",
                              padding: "10px",
                              fontWeight: 600,
                              width: "35%",
                            }}
                          >
                            {label}
                          </td>
                          <td
                            style={{
                              border: "1px solid #111",
                              padding: "10px",
                            }}
                          >
                            {value || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p style={{ marginTop: "16px", textAlign: "center" }}>
                    For Limited Circulation |{" "}
                    <span style={{ color: "red", fontWeight: 700 }}>
                      CONFIDENTIAL
                    </span>
                  </p>
                </div>
              )}

              <button
                type="button"
                className="submit-btn"
                onClick={() => window.print()}
                style={{ marginTop: "16px" }}
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SignatureVerification;
