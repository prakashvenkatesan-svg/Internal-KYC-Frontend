// Pages where the chatbot is not shown: every step of the KYC / account
// opening flow (mobile OTP through KYC complete), re-KYC, and the admin
// console. Paths are compared lower-cased without a trailing slash.
const HIDDEN_PATHS = new Set([
  "/numberregistration",
  "/numberotp",
  "/emailverify",
  "/emailotp",
  "/panverify",
  "/pancard-verification",
  "/kra-details",
  "/income-details",
  "/digilocker-success",
  "/digilocker-details",
  "/bankdetails",
  "/reverse-penny-drop",
  "/bankproof",
  "/personaldetails",
  "/nomination",
  "/percentage-allocation",
  "/no-nomination",
  "/schemedetail",
  "/payment-details",
  "/payment-completed",
  "/payment-failed",
  "/photoverify",
  "/uploadsignature",
  "/kyc-complete",
  "/rekycpage",
]);

// Every page under these prefixes is hidden too ("/esign", "/esign/start").
const HIDDEN_PREFIXES = ["/esign", "/admin"];

export const isChatbotHidden = (pathname) => {
  const path = String(pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";

  return (
    HIDDEN_PATHS.has(path) ||
    HIDDEN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  );
};
