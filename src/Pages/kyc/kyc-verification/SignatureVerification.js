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
  const [pdfFrameLoading, setPdfFrameLoading] = useState(false);
  const [pdfFrameIssue, setPdfFrameIssue] = useState(false);
  const [message, setMessage] = useState("");
  const [hasAutoStartedEsign, setHasAutoStartedEsign] = useState(false);
  const [esignStatus, setEsignStatus] = useState("");
  const [providerStatus, setProviderStatus] = useState("");
  const [signedPdfUrl, setSignedPdfUrl] = useState("");
  const [ddpiDetails, setDdpiDetails] = useState(null);
  const [ddpiLoading, setDdpiLoading] = useState(false);
  const [applicationId, setApplicationId] = useState(
    () =>
      searchParams.get("application_id") ||
      localStorage.getItem("application_id") ||
      "",
  );
  const hasReturnFromEsign = searchParams.get("esign_return") === "1";
  const isCompleted = (esignStatus === "completed" || providerStatus === "sign_complete") && Boolean(signedPdfUrl);
  const isCheckingReturnedEsign = hasReturnFromEsign && !isCompleted;
  const assetBaseUrl = useMemo(
    () => String(api.defaults.baseURL || "").replace(/\/api\/?$/, ""),
    [],
  );

  useEffect(() => {
    const nextApplicationId =
      searchParams.get("application_id") ||
      localStorage.getItem("application_id") ||
      "";

    setApplicationId(nextApplicationId);
  }, [searchParams]);

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

  // Removed PDF frame timeout logic as PDF preview is skipped

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

  // Removed preparePdfUrl, previewPdf, and downloadPdf as PDF preview is bypassed

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

      let lat = "";
      let lng = "";

      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (geoError) {
        console.warn("Geolocation not captured:", geoError);
      }

      const response = await api.post(
        `/esign/applications/${applicationId}/start`,
        { lat, lng }
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
    if (!applicationId || hasReturnFromEsign || isCompleted || hasAutoStartedEsign) {
      return;
    }

    setHasAutoStartedEsign(true);
    handleStartEsign();
  }, [applicationId, hasReturnFromEsign, isCompleted, hasAutoStartedEsign]);

  // Auto-redirect to KYC Complete screen after a 10-second delay
  useEffect(() => {
    if (isCompleted) {
      const redirectTimer = window.setTimeout(() => {
        navigate("/kyc-complete");
      }, 10000); // 10 seconds

      return () => window.clearTimeout(redirectTimer);
    }
  }, [isCompleted, navigate]);

  return (
    <div className='container'>
      <KycStepper
        currentStep='complete'
        completedSteps={["contact", "identify", "personal", "scheme"]}
      />

      <div className=''>
        {!isCompleted && !hasReturnFromEsign && !message ? (
          <p>
            Please wait while we redirect you to the final eSign step...
          </p>
        ) : null}

        {/* DDPI Stamp Paper Review Hidden for now */}



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
          <div style={{ marginTop: "40px", textAlign: "center" }}>
            {loading ? (
              <div className="d-flex flex-column align-items-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 style={{ color: "#264095" }}>Preparing eSign...</h5>
                <p className="text-muted">You will be redirected shortly.</p>
              </div>
            ) : (
              <button
                type='button'
                className='submit-btn'
                style={{
                  width: "auto",
                  minWidth: "320px",
                  maxWidth: "480px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  paddingLeft: "32px",
                  paddingRight: "32px",
                }}
                onClick={handleStartEsign}
                disabled={loading || statusLoading}
              >
                Start eSign
              </button>
            )}
          </div>
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
      </div>
    </div>
  );
};

export default SignatureVerification;
