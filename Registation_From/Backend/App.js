const express = require("express");
const Collections = require("./mongo");
const cors = require("cors");
const app = express();
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your-email@gmail.com",
        pass: "your-gmail-password",
    },
});

// Function to generate unique 8-character alphanumeric ID
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Function to generate unique user ID
async function generateUniqueUserId() {
    let userId = generateUniqueId();
    while (await Collections.exists({ userId })) {
        userId = generateUniqueId();
    }
    return userId;
}

// Function to send confirmation email
async function sendConfirmationEmail(email, userId) {
    try {
        await transporter.sendMail({
            from: "paliwalbhai503@gmail.com", // Your Gmail email address
            to: email,
            subject: "Account Confirmation",
            html: `<p>Your user ID is: ${userId}</p>`,
        });
        console.log("Confirmation email sent to:", email);
    } catch (error) {
        console.error("Error sending confirmation email:", error);
    }
}

app.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        const userId = await generateUniqueUserId();
        console.log("Generated userId:", userId);

        let user = await Collections.findOne({ email });
        if (user) {
            return res.json("exist");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new Collections({ email, password: hashedPassword, userId });
        await user.save();
        await sendConfirmationEmail(email, userId);
        console.log("User registered successfully");
        res.json("notexist");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json("Error occurred");
    }
});


app.post("/", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exists with the provided email
        const user = await Collections.findOne({ email });

        // If user does not exist, respond with "notexist"
        if (!user) {
            return res.json("notexist");
        }

        // Check if the provided password matches the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // If password is not valid, respond with "notexist"
        if (!isPasswordValid) {
            return res.json("notexist");
        }

        // If both email and password are correct, respond with "exist"
        console.log("Email and password are correct");
        res.json("exist");
    } catch (error) {
        // Handle any errors that occur during the database operation
        console.error("Error:", error);
        res.status(500).json("Error occurred");
    }
});

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
