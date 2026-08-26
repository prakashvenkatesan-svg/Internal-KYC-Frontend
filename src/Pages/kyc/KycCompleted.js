import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import KycStepper from "../../Components/kyc/KycStepper";
import api from "../../services/api";

const KycCompleted = () => {
  const navigate = useNavigate();
  const [processingPdf, setProcessingPdf] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");

  const getPdfResponse = async () => {
    const applicationId = localStorage.getItem("application_id");

    if (!applicationId) {
      setPdfMessage("Application ID not found. PDF can be downloaded later from the admin dashboard.");
      return null;
    }

    try {
      setProcessingPdf(true);
      setPdfMessage("");

      const response = await api.get(`/contact/applications/${applicationId}/pdf`, {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"] || "";
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] || `account_opening_${applicationId}.pdf`;
      const blob = new Blob([response.data], { type: "application/pdf" });

      if (response.headers["x-pdf-warnings"]) {
        setPdfMessage(
          "Test PDF is ready. Some production fields are still missing, so this file should be used only for localhost/UAT.",
        );
      }

      return { blob, fileName };
    } catch (error) {
      setPdfMessage(
        error.response?.data?.message ||
          "Unable to generate the PDF right now. You can retry below or download it later from admin.",
      );
      return null;
    } finally {
      setProcessingPdf(false);
    }
  };

  const previewPdf = async () => {
    const pdfResult = await getPdfResponse();
    if (!pdfResult) return;

    const previewUrl = window.URL.createObjectURL(pdfResult.blob);
    window.open(previewUrl, "_blank", "noopener,noreferrer");
    setPdfMessage("PDF preview opened in a new tab.");

    window.setTimeout(() => {
      window.URL.revokeObjectURL(previewUrl);
    }, 60_000);
  };

  const downloadPdf = async () => {
    const pdfResult = await getPdfResponse();
    if (!pdfResult) return;

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

  return (
    <div className='container py-5'>
      <KycStepper
        currentStep='complete'
        completedSteps={["contact", "identify", "personal", "scheme", "complete"]}
      />

      <div style={{ marginTop: "40px", height: "80vh", width: "100%", borderRadius: "16px", overflow: "hidden", boxShadow: "0 18px 48px rgba(38, 64, 149, 0.12)" }}>
        <iframe
          src="/ACM-Thank You.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
          title="Completion Screen"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "30px" }}>
        <button
          type='button'
          className='submit-btn'
          style={{ maxWidth: "240px", margin: "0" }}
          onClick={downloadPdf}
          disabled={processingPdf}
        >
          {processingPdf ? "Preparing PDF..." : "Download Your Application"}
        </button>
        <button
          type='button'
          className='submit-btn'
          style={{ maxWidth: "240px", margin: "0" }}
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default KycCompleted;
