import React, { useEffect, useState } from "react";

import "../Style.css";

const investorAttentionMessages = [
  "Stock Brokers can accept securities as margin from clients only by way of pledge in the depository system w.e.f. September 1, 2020.",
  "Update your mobile number & email Id with your stock broker/depository participant and receive OTP directly from depository on your email id and/or mobile number to create pledge.",
  "Investors may please refer to the Exchange's Frequently Asked Questions (FAQs) issued vide circular reference NSE/INSP/45191 dated July 31, 2020 and NSE/INSP/45534 dated August 31, 2020 and other guidelines issued from time to time in this regard.",
  "Prevent unauthorized transactions in your Trading/Demat Account. Update your mobile numbers/email IDs with your stock brokers/Depository Participant. Receive alerts/information of your transaction/all debit and other important transactions in your Trading/ Demat Account directly from Exchange/CDSL at the end of the day. Issued in the interest of investors.",
  "KYC is one time exercise while dealing in securities markets - once KYC is done through a SEBI registered intermediary (broker, DP, Mutual Fund etc.), you need not undergo the same process again when you approach another intermediary.",
  "No need to issue cheques by investors while subscribing to IPO. Just write the bank account number and sign in the application form to authorize your bank to make payment in case of allotment. No worries for refund as the money remain in investor's account.",
  "We understand that certain investment advisors may be approaching members of the public including our clients, representing that they are our partners, or representing that their investment advice is based on our research. Please note that we have not engaged any third parties to render any investment advisory services on our behalf. We do not share our research reports or our clients' personal or financial data with any third parties and have not authorized any such person to represent us in any manner. Persons making investments on the basis of such advice may lose all or a part of their investments along with the fee paid to such unscrupulous persons. Please be cautious about any phone call that you may receive from persons representing to be such investment advisors, or a part of research firm offering advice on securities. Do not make payments through e-mail links, WhatsApp or SMS. Please do not share your personal or financial information with any person without proper verification. Always trade through a registered broker.",
  "Beware of fixed/guaranteed/regular returns/ capital protection schemes. Brokers or their authorized persons or any of their associates are not authorized to offer fixed/guaranteed/regular returns/ capital protection on your investment or authorized to enter into any loan agreement with you to pay interest on the funds offered by you. Please note that in case of default of a member claim for funds or securities given to the broker under any arrangement/ agreement of indicative return will not be accepted by the relevant Committee of the Exchange as per the approved norms.",
  "Do not keep funds idle with the Stock Broker. Please note that your stock broker has to return the credit balance lying with them, within three working days in case you have not done any transaction within last 30 calendar days. Please note that in case of default of a Member, claim for funds and securities, without any transaction on the exchange will not be accepted by the relevant Committee of the Exchange as per the approved norms.",
  "Check the frequency of accounts settlement opted for. If you have opted for running account, please ensure that your broker settles your account and, in any case, not later than once in 90 days (or 30 days if you have opted for 30 days settlement). In case of declaration of trading member as defaulter, the claims of clients against such defaulter member would be subject to norms for eligibility of claims for compensation from IPF to the clients of the defaulter member. These norms are available on Exchange website at following link: https://www.nseindia.com/invest/about-defaulter-section",
  "Brokers are not permitted to accept transfer of securities as margin. Securities offered as margin/ collateral MUST remain in the account of the client and can be pledged to the broker only by way of 'margin pledge', created in the Depository system. Clients are not permitted to place any securities with the broker or associate of the broker or authorized person of the broker for any reason. Broker can take securities belonging to clients only for settlement of securities sold by the client.",
  "Always keep your contact details viz. Mobile number/Email ID updated with the stock broker. Email and mobile number is mandatory and you must provide the same to your broker for updation in Exchange records. You must immediately take up the matter with Stock Broker/Exchange if you are not receiving the messages from Exchange/Depositories regularly.",
  "Check your securities/MF/bonds in the consolidated account statement issued by NSDL/CDSL every month.",
  "Don't ignore any emails/SMSs received from the Exchange for trades done by you. Verify the same with the Contract notes/Statement of accounts received from your broker and report discrepancy, if any, to your broker in writing immediately and if the Stock Broker does not respond, please take this up with the Exchange/Depositories forthwith.",
  "Check messages sent by Exchanges on a weekly basis regarding funds and securities balances reported by the trading member, compare it with the weekly statement of account sent by broker and immediately raise a concern to the exchange if you notice a discrepancy.",
  "Please do not transfer funds, for the purposes of trading to anyone, including an authorized person or an associate of the broker, other than a SEBI registered Stock broker.",
  "Do not deal with unregistered intermediaries (who are not registered with SEBI/Exchanges).",
];

const InvestorAttentionScroller = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((currentIndex) =>
        currentIndex === investorAttentionMessages.length - 1
          ? 0
          : currentIndex + 1,
      );
    }, 15000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  return (
    <section className='investor-attention-scroller' aria-labelledby='investor-attention-title'>
      <div className='container'>
        <div className='investor-attention-shell'>
          <div className='investor-attention-label'>
            <span className='investor-attention-kicker'>Investor</span>
            <span id='investor-attention-title'>Attention</span>
          </div>
          <div className='investor-attention-track-wrap'>
            <p className='investor-attention-message' key={activeIndex}>
              {investorAttentionMessages[activeIndex]}
            </p>
            <div className='investor-attention-dots' aria-label='Investor attention messages'>
              {investorAttentionMessages.map((message, index) => (
                <button
                  type='button'
                  className={`investor-attention-dot ${
                    index === activeIndex ? "active" : ""
                  }`}
                  key={message}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show investor attention message ${index + 1}`}
                  aria-pressed={index === activeIndex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestorAttentionScroller;
