const User = require("../models/User");

const OTP = require("../models/OTP");

const otpGenerator = require("otp-generator");

const bcrypt = require("bcrypt");

const Profile = require("../models/Profile");

const jwt = require("jsonwebtoken");

require("dotenv").config();

// send OTP
exports.sendOTP = async (request, response) => {
    try {
        // fetch email from request ki body
        const {email} = request.body;

        // check if user already exist
        const checkUserPresent = await User.findOne({email});

        // if user already exist, then return response
        if (checkUserPresent) {
            return response.status(401).json({
                success: false,
                message: "User already generated"
            });
        }

        // generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        console.log("OTP generated: ", otp);

        // check unique otp or not
        let result = await OTP.findOne({otp: otp});

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};

        // create an entry for OPT
        const otpBody = await OTP.create(otpPayload);

        console.log(otpBody);

        // return response successful
        response.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            otp
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Signup
exports.signUp = async (request, response) => {
    try {
        // data fetch from request ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = request.body;

        // validate karlo
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp)
        {
            return response.status(403).json({
                success: false,
                message: "All Fields are required"
            });
        }

        // 2 password match
        if (password !== confirmPassword)
        {
            return response.status(400).json({
                success: false,
                message: "Password and ConfirmPassword Value does not match, please try again"
            });
        }

        // check user already exists or not
        const existingUser = await User.findOne({email});
        if (existingUser)
        {
            return response.status(400).json({
                success: false,
                message: "User is already registered"
            });
        }

        // find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log(recentOtp);

        // validate OTP
        if (recentOtp.length === 0)
        {
            // OTP not found
            return response.status(400).json({
                success: false,
                message: "OTP Not Found"
            });
        }
        else if (otp !== recentOtp.otp)
        {
            // Invalid OTP
            return response.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Entry create in DB
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        // return response
        return response.status(200).json({
            success: true,
            message: "User registered Successfully",
            user
        });
    }
    catch (error)
    {
        console.log(error);
        return response.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again"
        });
    }
}

// Login
exports.login = async (request, response) => {
    try
    {
        // get data from req body
        const {email, password} = request.body;

        // validate data
        if (!email || !password)
        {
            return response.status(403).json({
                success: false,
                message: "All fields are required, please try again"
            });
        }

        // user check exists or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if (!user)
        {
            return response.status(401).json({
                success: false,
                message: "User is not registered, please signup first"
            });
        }

        // generate JWT, after password matching
        if (await bcrypt.compare(password, user.password))
        {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            });

            user.token = token;
            user.password = null;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            response.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in Successfully"
            });
        }
        else
        {
            return response.status(401).json({
                success: false,
                message: "Password is incorrect"
            });
        }
    }
    catch(error)
    {
        console.log(error);
        return response.status(500).json({
            success: false,
            message: "Login Failed"
        });
    }
}

// change Password
exports.changePassword = async (request, response) => {
    // get data from req body
    // get oldPassword, newPassword, confirmNewPassword
    // validation
    // update pwd in DB
    // send mail - password updated
    // return response
}