import React, { useRef, useState } from "react";
import { toast } from "react-toastify";

import phone from "../assets/phone.png";
import email from "../assets/email.png";
import Location from "../assets/Location.png";
import time from "../assets/time.png";

import otp from "../assets/otp.png";
import api from "../services/api";

const contactData = [
  {
    tag: "1. Reach Out Client Care",
    title: "Client Care Department",
    phone: "(+91) 92402 62108",
    email: "clientcare@aionioncapital.com",
    address:
      "3rd Floor, Meerlan Towers, No. 33 Hanumantha Road, Royapettah, Chennai - 600014",
    timing: "Mon-Fri (9 AM to 6 PM, IST)",
  },
  {
    tag: "2. Reach Out Grievance Redressal Officer",
    title: "Ms Swati Keshari",
    phone: "(+91) 7305088516",
    email: "grievances@aionioncapital.com",
    address:
      "3rd Floor, Meerlan Towers, No. 33 Hanumantha Road, Royapettah, Chennai - 600014",
    timing: "Mon-Fri (9 AM to 6 PM, IST)",
  },
  // {
  //   tag: "3. Reach Out Head of Operations",
  //   title: "Mr Kumar Mahlingam Iyer",
  //   phone: "(+91) 8925808627",
  //   email: "kumarmahlingam.iyer@aionioncapital.com",
  //   address:
  //     "3rd Floor, Meerlan Towers, No. 33 Hanumantha Road, Royapettah, Chennai - 600014",
  //   timing: "Mon-Fri (9 AM to 6 PM, IST)",
  // },
  {
    tag: "3. Reach Out Director",
    title: " Mr Anish Gupta",
    phone: "(+91) 8925808630",
    email: "compliance@aionioncapital.com",
    address:
      "3rd Floor, Meerlan Towers, No. 33 Hanumantha Road, Royapettah, Chennai - 600014",
    timing: "Mon-Fri (9 AM to 6 PM, IST)",
  },
];

const teambranch = [
  {
    city: "HEAD OFFICE",
    address: [
      "Reg. Office: 3rd Floor, Meerlan Towers,",
      "No. 33 Hanumantha Road, Royapettah,",
      "Chennai - 600 014,",
      "Tamil Nadu",
      "Ph: 044-46895225",
    ],
  },

  {
    city: "COIMBATORE",
    address: [
      "Grand CAG Central, 3rd Floor, NAVA INDIA,",
      "110, Avinashi Rd, Peelamedu,",
      "Coimbatore - 641037,",
      "Tamil Nadu ",
    ],
  },

  {
    city: "TRICHY",
    address: [
      "ANSHIL ARCADE, 2nd Floor,",
      "Old No. 11, New No. 39 (Plot No. 660),",
      "EVR Salai, K.K. Nagar,",
      "Tiruchirappalli - 620 021,",
      "Tamil Nadu",
    ],
  },

  {
    city: "MADURAI",
    address: [
      "70, Navalar Nagar 3rd St,",
      "Sakthi Velammal Nagar, S S Colony,",
      "Madurai - 625016,",
      "Tamil Nadu",
    ],
  },
  {
    city: "NAMAKKAL",
    address: [
      "Door No: 341/113A1, 1st Floor,",
      "S.P. Pudur Main Road, Paramathi Rd,",
      "Namakkal - 637001,",
      "Tamil Nadu",
    ],
  },
  {
    city: "BANGALORE",
    address: [
      "2062, 1st Floor,",
      "23rd Main Rd, Vanganahalli,",
      "1st Sector, HSR Layout,",
      "Bengaluru - 560102,",
      "Karnataka",
    ],
  },
];

const NAME_REGEX = /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*\.?$/;
const EMAIL_REGEX =
  /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const URL_REGEX = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|info|xyz|ru|cn|top|io|biz|link|click|site|online|shop)\b)/i;
const HTML_REGEX = /<[^>]*>/;
const EMAIL_IN_TEXT_REGEX = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const REPEATED_CHAR_REGEX = /(.)\1{5,}/;

const DISPOSABLE_EMAIL_DOMAINS = [
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "yopmail.com",
  "throwawaymail.com",
  "trashmail.com",
  "getnada.com",
  "sharklasers.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "mohmal.com",
  "emailondeck.com",
];

const MESSAGE_MIN_LENGTH = 20;
const MESSAGE_MAX_LENGTH = 1000;
const MIN_FILL_TIME_MS = 4000;
const SUBMIT_COOLDOWN_MS = 60 * 1000;
const LAST_SUBMIT_KEY = "contact_last_submit_at";

const validateField = (name, rawValue) => {
  const value = (rawValue || "").trim();

  switch (name) {
    case "first_name":
      if (!value) return "First name is required";
      if (value.length < 2) return "First name must be at least 2 characters";
      if (value.length > 50) return "First name must be under 50 characters";
      if (!NAME_REGEX.test(value))
        return "First name can contain only letters, spaces, dots and hyphens";
      if (REPEATED_CHAR_REGEX.test(value)) return "Please enter a valid first name";
      return "";

    case "last_name":
      if (!value) return "Last name is required";
      if (value.length > 50) return "Last name must be under 50 characters";
      if (!NAME_REGEX.test(value))
        return "Last name can contain only letters, spaces, dots and hyphens";
      if (REPEATED_CHAR_REGEX.test(value)) return "Please enter a valid last name";
      return "";

    case "email": {
      if (!value) return "Email is required";
      if (value.length > 100) return "Email must be under 100 characters";
      if (!EMAIL_REGEX.test(value) || value.includes(".."))
        return "Please enter a valid email address";
      const domain = value.split("@")[1].toLowerCase();
      if (DISPOSABLE_EMAIL_DOMAINS.includes(domain))
        return "Temporary / disposable email addresses are not allowed";
      return "";
    }

    case "phone_number":
      if (!value) return "Phone number is required";
      if (!MOBILE_REGEX.test(value))
        return "Please enter a valid 10-digit mobile number";
      if (/^(\d)\1{9}$/.test(value)) return "Please enter a valid mobile number";
      return "";

    case "message":
      if (!value) return "Message is required";
      if (value.length < MESSAGE_MIN_LENGTH)
        return `Message must be at least ${MESSAGE_MIN_LENGTH} characters`;
      if (value.length > MESSAGE_MAX_LENGTH)
        return `Message must be under ${MESSAGE_MAX_LENGTH} characters`;
      if (HTML_REGEX.test(value)) return "HTML tags are not allowed in the message";
      if (URL_REGEX.test(value)) return "Links / URLs are not allowed in the message";
      if (EMAIL_IN_TEXT_REGEX.test(value))
        return "Please do not include email addresses in the message";
      if (REPEATED_CHAR_REGEX.test(value)) return "Please enter a meaningful message";
      if (!/[A-Za-z]{2,}/.test(value)) return "Please enter a meaningful message";
      return "";

    default:
      return "";
  }
};

const sanitizeInput = (name, value) => {
  switch (name) {
    case "first_name":
    case "last_name":
      return value.replace(/[^A-Za-z .'-]/g, "").replace(/\s{2,}/g, " ").slice(0, 50);
    case "email":
      return value.replace(/\s/g, "").slice(0, 100);
    case "phone_number":
      return value.replace(/\D/g, "").slice(0, 10);
    case "message":
      return value.slice(0, MESSAGE_MAX_LENGTH);
    default:
      return value;
  }
};

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  // Honeypot field: hidden from humans, bots usually fill it
  const [website, setWebsite] = useState("");
  const formLoadedAt = useRef(Date.now());

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizeInput(name, value),
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (!value) return;
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) nextErrors[field] = error;
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      message: "",
    });
    setWebsite("");
    formLoadedAt.current = Date.now();
  };

  const getLastSubmitAt = () => {
    try {
      return Number(localStorage.getItem(LAST_SUBMIT_KEY)) || 0;
    } catch {
      return 0;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Bot checks: honeypot filled or form submitted too quickly.
    // Pretend success so bots don't learn they were blocked.
    if (website || Date.now() - formLoadedAt.current < MIN_FILL_TIME_MS) {
      toast.success("Your enquiry has been submitted successfully");
      resetForm();
      return;
    }

    const sinceLastSubmit = Date.now() - getLastSubmitAt();
    if (sinceLastSubmit < SUBMIT_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((SUBMIT_COOLDOWN_MS - sinceLastSubmit) / 1000);
      setErrors({
        general: `Please wait ${waitSeconds} seconds before sending another message`,
      });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone_number: formData.phone_number.trim(),
        message: formData.message.trim(),
      };

      const response = await api.post("/contact/enquiries", payload);
      const responseMessage =
        response?.data?.message || "Your enquiry has been submitted successfully";

      toast.success(responseMessage);
      try {
        localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
      } catch {
        // ignore storage errors
      }
      resetForm();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to submit your enquiry right now";

      setErrors({
        general: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='container'>
        <h2 className='text-center'>Contact Us</h2>
        <h3 className='text-center contact-heading'>
          Any question or remarks? Just write us a message!
        </h3>

        <div className='row contact-card'>
          <div className='col-lg-4 contact-card-left'>
            <h3>Contact Information</h3>
            <p>Say something to start a live chat!</p>
            <div className='d-flex Contact-card-content'>
              <img src={phone} alt='phone' className='contactimg' />
              <p>(+91) 92402 62108</p>
            </div>
            <div className='d-flex Contact-card-content'>
              <img src={email} alt='phone' className='contactimg' />
              <p>clientcare@aionioncapital.com</p>
            </div>
            <div className='d-flex Contact-card-content'>
              <img src={Location} alt='phone' className='contactimg' />
              <p className='address'>
                {`3rd Floor, Meerlan Towers,
                No. 33 Hanumantha Road, Royapettah,
                Chennai - 600 014
                Ph: 044-46895225`}
              </p>
            </div>
          </div>

          <div className='col-lg-8 contact-card-right'>
            <div className='contact-container'>
              <form className='contact-form' onSubmit={handleSubmit} noValidate>
                {/* Honeypot - hidden from real users */}
                <div
                  aria-hidden='true'
                  style={{
                    position: "absolute",
                    left: "-10000px",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                  }}
                >
                  <label htmlFor='contact_website'>Website</label>
                  <input
                    id='contact_website'
                    type='text'
                    name='website'
                    tabIndex={-1}
                    autoComplete='off'
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className='form-row'>
                  <div className='form-group'>
                    <label>First Name</label>
                    <input
                      type='text'
                      name='first_name'
                      value={formData.first_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={50}
                      autoComplete='given-name'
                    />
                    {errors.first_name && (
                      <p className='error-text'>{errors.first_name}</p>
                    )}
                  </div>

                  <div className='form-group'>
                    <label>Last Name</label>
                    <input
                      type='text'
                      name='last_name'
                      value={formData.last_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={50}
                      autoComplete='family-name'
                    />
                    {errors.last_name && (
                      <p className='error-text'>{errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div className='form-row'>
                  <div className='form-group'>
                    <label>Email</label>
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={100}
                      autoComplete='email'
                    />
                    {errors.email && <p className='error-text'>{errors.email}</p>}
                  </div>

                  <div className='form-group'>
                    <label>Phone Number</label>
                    <input
                      type='tel'
                      name='phone_number'
                      value={formData.phone_number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      inputMode='numeric'
                      maxLength={10}
                      autoComplete='tel-national'
                    />
                    {errors.phone_number && (
                      <p className='error-text'>{errors.phone_number}</p>
                    )}
                  </div>
                </div>

                <div className='form-group full-width'>
                  <label>Message</label>
                  <textarea
                    name='message'
                    placeholder='Write your message..'
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={MESSAGE_MAX_LENGTH}
                  />
                  <small style={{ alignSelf: "flex-end", color: "#888" }}>
                    {formData.message.trim().length}/{MESSAGE_MAX_LENGTH}
                  </small>
                  {errors.message && <p className='error-text'>{errors.message}</p>}
                </div>

                {errors.general && <p className='error-text'>{errors.general}</p>}

                <div className='btn-wrapper'>
                  <button
                    type='submit'
                    className='send-message-btn'
                    disabled={loading}
                  >
                    <img src={otp} alt='Send' className='send-icon' />
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className='contact-details'>
        <div className='container'>
          <h2 className='text-center'>Escalation Matrix</h2>
          <h3 className='text-center'>Details of Contact Persons</h3>

          <div className='row contact-row'>
            {contactData.map((item, index) => (
              <div className='col-lg-6 mb-4' key={index}>
                <div className='contact-card-detail'>
                  <div>
                    <h4 className='contact-card-detail-content'>{item.tag}</h4>
                  </div>
                  <div className='contact-person'>
                    <h3>{item.title}</h3>

                    <div className='d-flex Contact-card-content'>
                      <img src={phone} alt='phone' className='contactimg' />
                      <p>{item.phone}</p>
                    </div>

                    <div className='d-flex Contact-card-content'>
                      <img src={email} alt='email' className='contactimg' />
                      <p>{item.email}</p>
                    </div>

                    <div className='d-flex Contact-card-content'>
                      <img
                        src={Location}
                        alt='location'
                        className='contactimg'
                      />
                      <p>{item.address}</p>
                    </div>

                    <div className='d-flex Contact-card-content'>
                      <img src={time} alt='time' className='contactimg' />
                      <p>{item.timing}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="about-Section">
  <div className="container">
    <h2 className="text-center branch-heading">
      Our Branch Address
    </h2>

    <div className="row">
      {teambranch.map((branch, index) => (
        <div className="col-lg-4 col-md-6 mb-4" key={index}>
          <div className="About-card h-100">
            <h4>{branch.city}</h4>

            <div className="address-text">
              {branch.address.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
    </div>
  );
};

export default Contact;
