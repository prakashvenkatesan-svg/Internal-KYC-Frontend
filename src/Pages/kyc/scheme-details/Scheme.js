import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import schemeprofile from "../../../assets/schemeprofile.png";
import schemeexclamatory from "../../../assets/schemeexclamatory.png";

import exclamatory from "../../../assets/exclamatory.png";
import graph from "../../../assets/graph.png";

import KycStepper from "../../../Components/kyc/KycStepper";
import KycInfoSection from "../../../Components/kyc/KycInfoSection";

const Scheme = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  const [showBrokeragePopup, setShowBrokeragePopup] = useState(false);

  const [showChargesPopup, setShowChargesPopup] = useState(false);

  const [tradingChecked, setTradingChecked] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/payment-details");
  };

  return (
    <div className='container'>
      <KycStepper
        currentStep='scheme'
        completedSteps={["contact", "identify", "personal"]}
      />

      <div className='row'>
        <div className='col-lg-6'>
          <div className='scheme-card'>
            <div className='scheme-header'>
              <img
                src={schemeprofile}
                alt='schemeprofile'
                className='schemeprofileimg'
                onClick={() => setShowBrokeragePopup(true)}
              />
              <h3 className=''>Scheme Details</h3>
            </div>

            <div className='scheme-body'>
              <h3>Account Opening Charges</h3>

              <h2>
                ₹ 2499 + Gst <span>(DP AMC : Nil)</span>
              </h2>

              <p>
                For Resident Individuals, Non-Resident Individuals (NRI), and
                Non-Individuals
              </p>

              <div className='d-flex gap-2'>
                <div className='scheme-btn-wrapper'>
                  <div className='d-flex gap-3'>
                    <div className='scheme-btn-group'>
                      <button
                        type='button'
                        className='scheme-btn'
                        onClick={() => setShowBrokeragePopup(true)}
                      >
                        <img
                          src={schemeexclamatory}
                          alt='schemeexclamatory'
                          className='schemeexclamatoryimg'
                        />
                        Brokerage Plans
                      </button>
                    </div>

                    <div className='scheme-btn-group'>
                      <button
                        type='button'
                        className='scheme-btn'
                        onClick={() => setShowChargesPopup(true)}
                      >
                        <img
                          src={schemeexclamatory}
                          alt='schemeexclamatory'
                          className='schemeexclamatoryimg'
                        />
                        Schedule of Charges
                      </button>
                    </div>
                  </div>
                </div>

                <>
                  {/* Popup */}
                  {showBrokeragePopup && (
                    <div
                      className='popup-overlay'
                      onClick={() => setShowBrokeragePopup(false)}
                    >
                      <div
                        className='popup-card'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h4 className='popup-header'>
                          Trading Account Tariff (Brokerage Plan)
                        </h4>

                        <div className='popup-content'>
                          <h4>Brokerage</h4>

                          <div className='brokerage-table'>
                            <div className='table-row'>
                              <span>Segment</span>
                              <span>%</span>
                              <span>Minimum Paise per Share</span>
                            </div>

                            <div className='table-row'>
                              <span>Equity Cash Intraday</span>
                              <span>0.075%</span>
                              <span>0.01</span>
                            </div>

                            <div className='table-row'>
                              <span>Equity Cash Delivery</span>
                              <span>0.75 %</span>
                              <span>0.01</span>
                            </div>

                            <div className='table-row'>
                              <span>Bond (Debt Segment)</span>
                              <span>0.75% for Sale Transaction</span>
                              <span>-</span>
                            </div>
                          </div>
                        </div>

                        <div className='popup-subcontent'>
                          <div className='other-charges'>
                            <h4 className='charges-title'>Other Charges</h4>

                            <div className='charges-row'>
                              <span>Account Opening Charges :</span>
                              <span>
                                Rs.2499/- + GST For Resident Individuals,
                                Non-Resident Individuals (NRI), and
                                Non-Individuals
                              </span>
                            </div>

                            <div className='charges-row'>
                              <span>
                                For Physical Contract Notes / Statements :
                              </span>
                              <span>Rs.200 + GST (per Instance)</span>
                            </div>

                            <div className='charges-row'>
                              <span>
                                For Cheque Bounce / Cheque Cancellation :
                              </span>
                              <span>Rs.1000 + GST</span>
                            </div>

                            <div className='charges-row'>
                              <span>Interest on Delayed Payment :</span>
                              <span>24% Per Annum</span>
                            </div>

                            <div className='charges-row'>
                              <span>Profile Modifications :</span>
                              <span>Rs.25 + GST</span>
                            </div>

                            <div className='charges-row'>
                              <span>Payment Gateway Charges :</span>
                              <span>NIL</span>
                            </div>

                            <div className='charges-row'>
                              <span>Statutory Charges :</span>
                              <span>
                                GST, STT, CTT, Transaction Charges, SEBI, Stamp
                                Duty, etc.
                                <br />
                                (Applicable as per Statutory Bodies)
                              </span>
                            </div>

                            <div className='charges-row'>
                              <span>GST 18% :</span>
                              <span>Brokerage, SEBI Charges and TOC</span>
                            </div>
                          </div>
                        </div>

                        <button
                          className='popup-close'
                          onClick={() => setShowBrokeragePopup(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                  {showChargesPopup && (
                    <div
                      className='popup-overlay'
                      onClick={() => setShowChargesPopup(false)}
                    >
                      <div
                        className='popup-card large-popup'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h4 className='popup-header'>Schedule of Charges</h4>

                        <div className='popup-body schedule-table'>
                          <div className='schedule-header'>
                            <span>Account Description</span>
                            <span>Charges (Rs.)</span>
                          </div>

                          <div className='schedule-row'>
                            <span>Account Opening :</span>
                            <span>NIL</span>
                          </div>

                          <div className='schedule-row'>
                            <span>Documentation Charges :</span>
                            <span>NIL</span>
                          </div>

                          <div className='schedule-row'>
                            <span>Custody :</span>
                            <span>NIL</span>
                          </div>

                          <div className='schedule-row'>
                            <span>Annual Maintenance Charges :</span>
                            <span>NIL</span>
                          </div>

                          <div className='schedule-row'>
                            <span>Transaction Charges (On Market) :</span>
                            <span>
                              Buy: NIL, Sell: Rs. 30.00 per ISIN or 0.04%
                              (w.e.h)*
                            </span>
                          </div>

                          <div className='schedule-row'>
                            <span>
                              Transaction Charges (Debt Segment On Market) :
                            </span>
                            <span>
                              Buy: Rs. 100.00 per ISIN, Sell: Rs. 100.00 per
                              ISIN
                            </span>
                          </div>

                          <div className='schedule-row'>
                            <span>
                              Transaction Charges (Off Market/Inter DP) :
                            </span>
                            <span>
                              Buy: NIL, Sell: Rs. 30.00 per ISIN or 0.04%
                              (w.e.h)*
                            </span>
                          </div>

                          <div className='schedule-row'>
                            <span>Dematerialisation :</span>
                            <span>
                              Rs. 150.00 per certificate + (Rs. 50.00 per
                              request) + courier charges at actual.
                            </span>
                          </div>

                          <div className='schedule-row'>
                            <span>Rematerialisation :</span>
                            <span>
                              Rs. 20.00 for every 100 Securities + courier
                              charges at actual
                            </span>
                          </div>

                          <div className='schedule-row'>
                            <span>Pledge and Unpledges :</span>
                            <span>
                              Rs. 50.00 per ISIN or 0.04% (w.e.h)* to Pledger
                            </span>
                          </div>

                          <div className='schedule-row'>
                            <span>Pledge Invocation (Pledgee) :</span>
                            <span>
                              Rs. 50.00 per ISIN or 0.04% (w.e.h)* to Pledgee
                            </span>
                          </div>

                          <div className='schedule-row'>
                            <span>Margin Pledge and Unpledge :</span>
                            <span>Rs. 30.00 per ISIN</span>
                          </div>

                          <div className='schedule-row'>
                            <span>Failed instruction charges :</span>
                            <span>Rs. 30.00 per ISIN</span>
                          </div>

                          <div className='schedule-row'>
                            <span>DIS Booklet charges :</span>
                            <span>
                              Rs. 100.00 per Booklet + courier charges at actual
                            </span>
                          </div>

                          <div className='schedule-row'>
                            <span>KYC Modification charges :</span>
                            <span>Rs. 25.00 per instruction</span>
                          </div>

                          <div className='schedule-row'>
                            <span>KRA Process charges :</span>
                            <span>
                              Rs. 35.00 for New KRA & Rs. 35.00 for Modification
                              KRA
                            </span>
                          </div>
                        </div>

                        <button
                          type='button'
                          className='popup-close'
                          onClick={() => setShowChargesPopup(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </>
              </div>
            </div>
          </div>
        </div>

        <div className='col-lg-6'>
          <form className='trading-card' onSubmit={handleSubmit}>
            <h2 className='trading-title'>Choose your trading preferences</h2>

            <p className='trading-subtitle'>We’ll Customize your Experience</p>

            <div>
              <img src={graph} alt='graph' className='graphimg' />
            </div>

            {/* <label className='trading-option'>
              <input
                type='checkbox'
                checked={tradingChecked}
                onChange={handleCheckboxChange}
              />

              <span>
                Equity, Mutual Funds, IPO, Bonds
                <br />& SLBM (Stock Lending and Borrowing Mechanism )
              </span>
            </label> */}

            {/* Error Message */}
            {/* <p ref={checkboxErrorRef} className='text-danger mt-2'></p> */}

            <span>
              Equity, Mutual Funds, IPO, Bonds & SLBM
              <br />
              (Stock Lending and Borrowing Mechanism )
            </span>

            <button className='submit-btn margin-top-20' type='submit'>
              Submit
            </button>
          </form>
        </div>
      </div>

      <KycInfoSection />
    </div>
  );
};

export default Scheme;
