// server.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

const app = express();

app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/mern_authentication', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User Model
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    email: String,
    passwordHash: String,
    otp: String,
    otpExpiry: Date,
}));

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password',
    },
});

// Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const otp = randomstring.generate({ length: 6, charset: 'numeric' });
        const otpExpiry = new Date(Date.now() + 5 * 60000); // OTP expires in 5 minutes

        const user = new User({ username, email, passwordHash, otp, otpExpiry });
        await user.save();

        // Send OTP to the user's email
        const mailOptions = {
            from: 'your_email@gmail.com',
            to: email,
            subject: 'Verification OTP',
            text: `Your verification OTP is: ${otp}`,
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email, otp, otpExpiry: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
        }

        // If OTP is valid, remove OTP fields from the user document
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
