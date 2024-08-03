const jwt = require("jsonwebtoken");

require("dotenv").config();

const User = require("../models/User");

// authentication
exports.auth = async (request, response, next) => {
    try
    {
        // extract token
        const token = request.cookies.token || request.body.token || request.header("Authorisation").replace("Bearer ", "");

        // if token missing return response
        if (!token)
        {
            return response.status(401).json({
                success: false,
                message: "Token is missing"
            });
        }

        // verify the token
        try
        {
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            request.user = decode;
        }
        catch (error)
        {
            // verification issue
            return response.status(401).json({
                success: false,
                message: "Token is invalid"
            });
        }
        next();
    }
    catch (error)
    {
        return response.status(401).json({
            success: false,
            message: "Something went wrong while validating the token"
        });
    }
}

// isStudent
exports.isStudent = async (request, response, next) => {
    try
    {
        if (request.user.accountType !== "Student")
        {
            return response.status(401).json({
                success: false,
                message: "This is a protected route for students only"
            });
        }
        next();
    }
    catch (error)
    {
        return response.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        });
    }
}

// isInstructor
exports.isInstructor = async (request, response, next) => {
    try
    {
        if (request.user.accountType !== "Instructor")
        {
            return response.status(401).json({
                success: false,
                message: "This is a protected route for instructors only"
            });
        }
        next();
    }
    catch (error)
    {
        return response.status(500).json({
            success: false,
            message: "Instructor role cannot be verified, please try again"
        });
    }
}

// isAdmin
exports.isAdmin = async (request, response, next) => {
    try
    {
        if (request.user.accountType !== "Admin")
        {
            return response.status(401).json({
                success: false,
                message: "This is a protected route for admin only"
            });
        }
        next();
    }
    catch (error)
    {
        return response.status(500).json({
            success: false,
            message: "Admin role cannot be verified, please try again"
        });
    }
}