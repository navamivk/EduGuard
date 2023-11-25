const { authenticator } = require('otplib');
const nodemailer = require('nodemailer');

// OTP Configuration
authenticator.options = {
  step: 300,
};

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'eduguardotp@gmail.com',
    pass: 'jdhl uxic icxg syez',
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: 'eduguardotp@gmail.com',
    to: email,
    subject: 'OTP for Admin Login',
    text: `Your OTP for Admin Login: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent via email');
  } catch (error) {
    console.error('Error sending OTP via email', error);
    throw error;
  }
};

module.exports = { authenticator, sendOTPEmail };
