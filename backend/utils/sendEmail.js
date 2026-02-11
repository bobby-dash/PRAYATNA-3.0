const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail'
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Define email options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'SecureShare'} <${process.env.FROM_EMAIL || process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html // Optional: You can add HTML templates later
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
