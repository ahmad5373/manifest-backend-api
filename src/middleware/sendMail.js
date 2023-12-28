const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Load environment variables
const USER_EMAIL = process.env.USER_EMAIL;
const USER_PASSWORD = process.env.USER_PASSWORD;

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: USER_EMAIL,
        pass: USER_PASSWORD,
    },
});

/**
 * Send an email using nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
const sendMail = async (to, subject, html) => {
    const mailOptions = {
        from: USER_EMAIL,
        to,
        subject,
        html,
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendMail;
