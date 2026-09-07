import React, { useState, useEffect } from "react";
import api from "../../../services/api";

import paymentImg from "../../../assets/paymentimg.png";

import KycStepper from "../../../Components/kyc/KycStepper";
import { toast } from "react-toastify";

/* ---------------------------------------------------------------
   Load Razorpay Checkout script dynamically (only once)
--------------------------------------------------------------- */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentSummary = () => {
  const [processing, setProcessing]       = useState(false);
  const [bankInfo, setBankInfo]           = useState(null);
  const [bankLoading, setBankLoading]     = useState(true);
  const [bankError, setBankError]         = useState("");

  // ---- Amount calculation (untouched from original) ----
  const savedSchemeSelections = JSON.parse(
    localStorage.getItem("scheme_selections") || "{}"
  );

  const accountOpeningCharges = savedSchemeSelections.annualCare
    ? 1249
    : 2499;

  const taxAmount = (accountOpeningCharges * 18) / 100;
  const total     = accountOpeningCharges + taxAmount;

  // ---- Auto-fetch registered bank details on mount ----
  useEffect(() => {
    const applicationId = localStorage.getItem("application_id");

    if (!applicationId) {
      setBankError("Application not found. Please complete the KYC process.");
      setBankLoading(false);
      return;
    }

    api
      .get(`/payment/registered-bank/${applicationId}`)
      .then((res) => {
        if (res.data.success) {
          setBankInfo(res.data.data);
        } else {
          setBankError("Could not load your registered bank details.");
        }
      })
      .catch((err) => {
        console.error("FETCH BANK ERROR:", err.response?.data || err.message);
        setBankError(
          err.response?.data?.message ||
            "Could not load bank details. Please try again."
        );
      })
      .finally(() => setBankLoading(false));
  }, []);

  // ---- PAYMENT HANDLER ----
  const handlePayment = async () => {
    if (processing) return;

    if (!bankInfo) {
      toast.error("Registered bank details not loaded. Please refresh.");
      return;
    }

    setProcessing(true);

    try {
      // 1. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        setProcessing(false);
        return;
      }

      const applicationId = localStorage.getItem("application_id") || "1";

      // 2. Backend creates Razorpay Order with TPV (registered bank enforced server-side)
      const response = await api.post("/payment/create-order", {
        application_id: Number(applicationId),
        amount:         total.toFixed(2),
        currency:       "INR",
      });

      const { order_id, key_id, amount, currency, name, email, phone } =
        response.data;

      // 3. Open Razorpay Checkout
      const options = {
        key:         key_id,
        amount,
        currency,
        name:        "Aionion Capital",
        description: "Trading and Demat Account Opening",
        order_id,
        prefill: { name, email, contact: phone },
        notes:   { application_id: applicationId },
        theme:   { color: "#1a56db" },

        // ---- SUCCESS HANDLER ----
        handler: async (razorpayResponse) => {
          try {
            const verifyRes = await api.post("/payment/verify", {
              razorpay_order_id:   razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature:  razorpayResponse.razorpay_signature,
            });

            if (verifyRes.data.success) {
              window.location.href = "/payment-completed";
            } else {
              toast.error("Payment verification failed. Please contact support.");
              window.location.href = "/payment-failed";
            }
          } catch (err) {
            console.error("PAYMENT VERIFY ERROR:", err.response?.data || err.message);
            toast.error("Payment verification error. Please contact support.");
            window.location.href = "/payment-failed";
          }
        },

        // ---- MODAL DISMISS ----
        modal: {
          ondismiss: () => {
            toast.warning("Payment cancelled. You can retry anytime.");
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("RAZORPAY PAYMENT FAILED:", response.error);
        toast.error(
          response.error?.description || "Payment failed. Please try again."
        );
        setProcessing(false);
      });

      rzp.open();
    } catch (error) {
      console.error("PAYMENT ERROR:", error.response?.data || error.message);
      toast.error("Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className='container'>
      <KycStepper
        currentStep='complete'
        completedSteps={["contact", "identify", "personal", "scheme"]}
      />

      <div className='row'>
        {/* LEFT IMAGE */}
        <div className='col-lg-6'>
          <img src={paymentImg} alt='payment' className='paymentimg' />
        </div>

        {/* RIGHT PAYMENT SUMMARY */}
        <div className='col-lg-6'>
          <div className='payment-summary-box'>
            <h3 className='payment-title text-center'>Payment Summary</h3>

            {/* ---- REGISTERED BANK DETAILS ---- */}
            <div className='registered-bank-box' style={{
              background: "#f0f7ff",
              border: "1px solid #bfdbfe",
              borderRadius: "10px",
              padding: "14px 16px",
              marginTop: "16px",
              marginBottom: "4px",
            }}>
              <p style={{ fontWeight: 700, fontSize: "13px", color: "#1e3a5f", marginBottom: "8px" }}>
                🏦 Registered Bank Account
              </p>

              {bankLoading && (
                <p style={{ fontSize: "13px", color: "#64748b" }}>Loading bank details...</p>
              )}

              {!bankLoading && bankError && (
                <p style={{ fontSize: "13px", color: "#dc2626" }}>⚠ {bankError}</p>
              )}

              {!bankLoading && bankInfo && (
                <>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", margin: "2px 0" }}>
                    {bankInfo.bank_name}
                  </p>
                  <p style={{ fontSize: "13px", color: "#475569", margin: "2px 0" }}>
                    Account: <strong>{bankInfo.masked_account}</strong>
                  </p>
                  <p style={{ fontSize: "13px", color: "#475569", margin: "2px 0" }}>
                    IFSC: <strong>{bankInfo.ifsc_code}</strong>
                  </p>
                  <p style={{ fontSize: "13px", color: "#475569", margin: "2px 0" }}>
                    Type: {bankInfo.account_type}
                  </p>
                </>
              )}

              <div style={{
                marginTop: "10px",
                padding: "8px 10px",
                background: "#fef3c7",
                border: "1px solid #fbbf24",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#92400e",
                fontWeight: 500,
              }}>
                ⚠ Please make the payment <strong>only from your registered bank account</strong> above.
                Payments from any other bank account will <strong>not be accepted</strong>.
              </div>
            </div>

            {/* HEADER */}
            <div className='payment-header d-flex justify-content-between fw-bold mt-4'>
              <span>Description</span>
              <span>Amount (Rs.)</span>
            </div>

            {/* ACCOUNT OPENING */}
            <div className='payment-row d-flex justify-content-between mt-3'>
              <span>Account Opening Charges</span>
              <span>{accountOpeningCharges.toFixed(2)}</span>
            </div>

            {/* TAX */}
            <div className='payment-row d-flex justify-content-between mt-3'>
              <span>18% Tax on Account Opening Charges</span>
              <span>{taxAmount.toFixed(2)}</span>
            </div>

            <hr />

            {/* TOTAL */}
            <div className='payment-total d-flex justify-content-between fw-bold'>
              <span>Total</span>
              <span>{total.toFixed(2)}</span>
            </div>

            <hr />

            {/* BUTTON */}
            <button
              type='button'
              className='payment-proceed-btn'
              onClick={handlePayment}
              disabled={processing || bankLoading || !!bankError}
            >
              {processing ? "Processing..." : "Proceed to Pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
