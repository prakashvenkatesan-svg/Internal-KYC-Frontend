import React, { useState } from "react";
import exclamatory from "../../assets/exclamatory.png";

const KycInfoSection = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className='row mb-5 kyc-info-section'>
      <div className='col-lg-6'>
        <div
          className='d-flex gap-3'
          style={{ cursor: "pointer" }}
          onClick={() => setShowModal(true)}
        >
          <img src={exclamatory} alt='exclamatory-symbol' className='symbol' />

          <p className='document-popup'>
            for the list of documents required to complete account opening
            process seamlessly.
          </p>
        </div>

        {showModal && (
          <div className='modal-overlay'>
            <div className='modal-box'>
              <div className='modal-header'>
                <span>📄</span>
                <h3>
                  Documents required for completing the account opening process
                  seamlessly
                </h3>
              </div>

              <div className='modal-body'>
                <div className='doc-item'>
                  <strong>1. PAN digital copy</strong>
                  <p>(JPEG, PNG, or PDF - max 5MB)</p>
                </div>

                <div className='doc-item'>
                  <strong>2. Aadhaar number</strong>
                  <p>(Aadhaar must be linked with mobile number)</p>
                </div>

                <div className='doc-item'>
                  <strong>3. Bank Proof</strong>
                  <p>
                    (Cancelled cheque / Passbook / Bank statement - max 5MB)
                  </p>
                </div>

                <div className='doc-item'>
                  <strong>4. Signature</strong>
                  <p>(Should match PAN - JPEG/PNG max 5MB)</p>
                </div>

                <div className='doc-item'>
                  <strong>5. Nominee Proof</strong>
                  <p>(PAN / Aadhaar / Voter ID / DL / Passport - max 5MB)</p>
                </div>
              </div>

              <div className='modal-footer'>
                <button
                  type='button'
                  className='close-btn'
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className='status-card'>
          <p>
            <strong>Additional Note :</strong> Please ensure that your Aadhaar
            and PAN are linked. You can check the status here
          </p>

          <a
            href='https://eportal.incometax.gov.in/iec/foservices/#/pre-login/link-aadhaar-status'
            target='_blank'
            rel='noopener noreferrer'
          >
            <button type='button' className='check-btn'>
              Check Status
            </button>
          </a>
        </div>
      </div>

      <div className='col-lg-6 registration-right'>
        <p className='feedback-text'>
          For any feedback on the account opening process or other inquiries,
          please feel free to reach out to us at <br />
          <a href='mailto:feedback@janioncapital.com' className='mail'>
            feedback@janioncapital.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default KycInfoSection;
