import React from "react";

import contactdetail from "../../assets/contactdetail.png";
import dematdetails from "../../assets/dematdetails.png";
import personaldetails from "../../assets/personaldetails.png";
import Bankdetails from "../../assets/Bankdetails.png";
import Applicationdetails from "../../assets/Applicationdetails.png";
import Esigndetails from "../../assets/Esigndetails.png";
import Kyccomplete from "../../assets/Kyccomplete.png";

const steps = [
  { key: "contact", label: "Contact Details", icon: contactdetail },
  { key: "identify", label: "Document verification", icon: dematdetails },
  { key: "personal", label: "Personal Details", icon: personaldetails },
  { key: "scheme", label: "Scheme Details", icon: Bankdetails },
  { key: "complete", label: "Payment & KYC Complete", icon: Kyccomplete },
];

const KycStepper = ({ currentStep, completedSteps = [] }) => {
  const getStepStatus = (stepKey) => {
    if (completedSteps.includes(stepKey)) return "completed";
    if (currentStep === stepKey) return "active";
    return "inactive";
  };

  return (
    <div className='kyc-stepper-wrapper'>
      <h2 className='text-center'>Open a Trading & Demat account </h2>
      <p className='text-center'>Aionion Capital Online Registration</p>

      <div className='kyc-stepper'>
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);

          return (
            <React.Fragment key={step.key}>
              <div className={`kyc-step ${status}`}>
                <div className={`kyc-circle ${status}`}>
                  <img src={step.icon} alt={step.label} />
                </div>
                <p className={`kyc-label ${status}`}>{step.label}</p>
              </div>

              {index !== steps.length - 1 && (
                <div className={`kyc-connector ${status}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default KycStepper;
