import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KycStepper from "../../../Components/kyc/KycStepper";
import api from "../../../services/api";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [bankInfo, setBankInfo] = useState(null);

  // Fetch full bank details to show which registered account must be used
  useEffect(() => {
    const applicationId = localStorage.getItem("application_id");
    if (!applicationId) return;

    api
      .get(`/payment/registered-bank/${applicationId}`)
      .then((res) => {
        if (res.data.success) setBankInfo(res.data.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className='container text-center mt-5'>
      <KycStepper
        currentStep='complete'
        completedSteps={["contact", "identify", "personal", "scheme"]}
      />

      {/* Failure heading */}
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <div style={{ fontSize: "56px", marginBottom: "8px" }}>❌</div>
        <h1 style={{ color: "#dc2626", fontWeight: 700, marginBottom: "8px" }}>
          Payment Failed
        </h1>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          Your payment was unsuccessful or the payment source did not match your
          registered bank account.
        </p>

        {/* Registered bank info — show FULL account number on failure */}
        {bankInfo && (
          <div style={{
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "12px",
            padding: "18px 20px",
            marginBottom: "24px",
            textAlign: "left",
          }}>
            <p style={{ fontWeight: 700, fontSize: "14px", color: "#92400e", marginBottom: "10px" }}>
              ⚠ You must pay from your registered bank account
            </p>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", margin: "4px 0" }}>
              {bankInfo.bank_name}
            </p>
            <p style={{ fontSize: "13px", color: "#374151", margin: "4px 0" }}>
              Account Holder: <strong>{bankInfo.account_holder_name}</strong>
            </p>
            {/* Full account number shown on failure page */}
            <p style={{ fontSize: "13px", color: "#374151", margin: "4px 0" }}>
              Account Number: <strong>{bankInfo.account_number}</strong>
            </p>
            <p style={{ fontSize: "13px", color: "#374151", margin: "4px 0" }}>
              IFSC: <strong>{bankInfo.ifsc_code}</strong>
            </p>
            <p style={{ fontSize: "13px", color: "#374151", margin: "4px 0" }}>
              Account Type: {bankInfo.account_type}
            </p>
            <p style={{
              fontSize: "12px",
              color: "#b45309",
              marginTop: "10px",
              fontWeight: 500,
            }}>
              Payments from any other bank account will be rejected by Razorpay TPV validation.
            </p>
          </div>
        )}

        <button
          type='button'
          className='submit-btn mt-2'
          onClick={() => navigate("/payment-details")}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default PaymentFailed;
