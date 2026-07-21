import React, { useEffect, useState } from "react";

import Aionionlogo from "../assets/Aionionlogo.png";
import appinvesting from "../assets/appinvesting.png";
import Playstore from "../assets/Playstore.png";
import Appstore from "../assets/Appstore.png";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.aionioncapital.plus&hl=en_IN";
const APP_STORE_URL =
  "https://apps.apple.com/in/app/aionion-capital-plus/id6754834631";
const WEB_PORTAL_URL = "http://tradeplus.aionioncapital.com/";

const detectPlatform = () => {
  const userAgent = navigator.userAgent || navigator.vendor || "";
  if (/android/i.test(userAgent)) return "android";
  if (/iPad|iPhone|iPod/.test(userAgent)) return "ios";
  if (/Macintosh/.test(userAgent) && "ontouchend" in document) return "ios";
  return "web";
};

const Plus = () => {
  const [platform, setPlatform] = useState("web");

  useEffect(() => {
    const detectedPlatform = detectPlatform();
    setPlatform(detectedPlatform);

    if (detectedPlatform === "android") {
      window.location.replace(PLAY_STORE_URL);
    } else if (detectedPlatform === "ios") {
      window.location.replace(APP_STORE_URL);
    }
  }, []);

  const isRedirecting = platform === "android" || platform === "ios";

  return (
    <main className='plus-page'>
      <section className='plus-hero'>
        <div className='container'>
          <div className='plus-layout'>
            <div className='plus-content'>
              <img src={Aionionlogo} alt='Aionion Capital' className='plus-logo' />
              <p className='plus-kicker'>Aionion Capital Plus</p>
              <h1>Trade on mobile or on the web</h1>
              <p className='plus-copy'>
                Access Aionion Capital Plus from the Play Store, App Store, or
                the TradePlus web portal.
              </p>

              {isRedirecting && (
                <div className='plus-redirect-card'>
                  <strong>
                    Redirecting you to the{" "}
                    {platform === "android" ? "Play Store" : "App Store"}.
                  </strong>
                  <span>If nothing happens, use the links below.</span>
                </div>
              )}

              <div className='plus-actions'>
                <a href={PLAY_STORE_URL} target='_blank' rel='noopener noreferrer'>
                  <img src={Playstore} alt='Get it on Google Play' />
                </a>
                <a href={APP_STORE_URL} target='_blank' rel='noopener noreferrer'>
                  <img src={Appstore} alt='Download on the App Store' />
                </a>
                <a
                  href={WEB_PORTAL_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='plus-web-link'
                >
                  Web Portal
                </a>
              </div>
            </div>

            <div className='plus-media'>
              <img src={appinvesting} alt='Aionion Capital Plus app' />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Plus;
