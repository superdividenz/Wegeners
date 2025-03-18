const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Get email credentials from Firebase config
const emailUser = functions.config().email.user;
const emailPass = functions.config().email.pass;

// Set up Nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // Change this to your email provider
  auth: {
    user: emailUser,  // Use environment variable for email address
    pass: emailPass,  // Use environment variable for email password
  },
});

// Firestore trigger to send an email when a new bid is added
exports.sendBidNotification = functions.firestore
  .document('bids/{bidId}')
  .onCreate(async (snap, context) => {
    const newBid = snap.data();

    const mailOptions = {
      from: emailUser,  // Use environment variable for email address
      to: newBid.email,  // Send email to the email provided in the form
      subject: 'Bid Submission Confirmation',
      text: `Hello ${newBid.name},\n\nThank you for submitting your bid! Here are the details:\n\nBid Type: ${newBid.bidType}\nServices: ${newBid.services.join(', ')}\nAdditional Info: ${newBid.additionalInfo || 'N/A'}\n\nWe will get back to you soon.\n\nBest regards,\nYour Company Name`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });
