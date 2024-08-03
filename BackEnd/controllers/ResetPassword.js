const User = require("../models/User");

const mailSender = require("../utils/mailSender");

const bcrypt = require("bcrypt");

// resetPasswordToken
exports.resetPasswordToken = async (request, response) => {
    try
    {
        // get email from request body
        const email = request.body.email;

        // check user for this email, email validation
        const user = await User.findOne({email: email});
        if (!user)
        {
            return response.json({
                success: false,
                message: "Your Email is not registered with us"
            });
        }

        // generate token
        const token = crypto.randomUUID();

        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email: email}, {
            token: token,
            resetPasswordExpires: Date.now() + 5 * 60 * 1000
        }, {new: true});

        // create url
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail containing the url
        await mailSender(email, "Password Reset Link", `Password Reset Link: ${url}`);

        // return response
        return response.json({
            success: true,
            message: "Email sent successfully, please check email and change pwd"
        });
    }
    catch (error)
    {
        console.log(error);
        return response.status(500).json({
            success: false,
            message: "Something went wrong while sending pwd mail"
        });
    }
}

// resetPassword
exports.resetPassword = async (request, response) => {
    try
    {
        // data fetch
        const {password, confirmPassword, token} = request.body;

        // validation
        if (!password || !confirmPassword)
        {
            return response.json({
                success: false,
                message: "Password not matching"
            });
        }

        // get user details from db using token
        const userDetails = await User.findOne({token: token});

        // if no entry - invalid token
        if (!userDetails)
        {
            return response.json({
                success: false,
                message: "Token is invalid"
            });
        }

        // token time check
        if (userDetails.resetPasswordExpires > Date.now())
        {
            return response.json({
                success: false,
                message: "Token is expired"
            });
        }

        // hash pwd
        const hashedPassword = await bcrypt.hash(password, 10);

        // update the password
        await User.findOneAndUpdate({token: token}, {password: hashedPassword}, {new: true});

        // return response
        return response.json({
            success: true,
            message: "Password reset successfully"
        });
    }
    catch (error)
    {
        console.error(error);
        return response.status(500).json({
            success: false,
            message: "Password not updated"
        });
    }
}