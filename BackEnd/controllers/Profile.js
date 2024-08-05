const Profile = require("../models/Profile");

const User = require("../models/User");

exports.updateProfile = async (request, response) => {
    try
    {
        // get data
        const {dateOfBirth="", about="", contactNumber, gender} = request.body;

        // get userID
        const id = request.user.id;

        // validation
        if (!contactNumber || !gender || !id)
        {
            return response.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.contactNumber = contactNumber;
        profileDetails.about = about;
        profileDetails.gender = gender;

        await profileDetails.save();

        // return response
        return response.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profileDetails
        });
    }
    catch (error)
    {
        return response.status(500).json({
            success: false,
            message: "Unable to update Profile Please try again",
            error: error.message
        });
    }
}

// deleteAccount
// Explore -> how can we schedule this deletion operation
exports.deleteAccount = async (request, response) => {
    try
    {
        // get id
        const id = request.user.id;

        // validation
        const userDetails = await User.findById(id);

        if (!userDetails)
        {
            return response.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // delete Profile
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails});

        // HW: un enroll user from all enrolled courses
        // delete user
        await User.findByIdAndDelete({_id: id});

        // return response
        return response.status(200).json({
            success: true,
            message: "Account deleted successfully",
            profileDetails
        });
    }
    catch (error)
    {
        return response.status(500).json({
            success: false,
            message: "Unable to delete Account Please try again",
            error: error.message
        });
    }
}

exports.getAllUserDetails = async (request, response) => {
    try
    {
        const id = request.user.id;

        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        return response.status(200).json({
            success: true,
            message: "User data fetched successfully",
            userDetails
        });
    }
    catch (error)
    {
        return response.status(500).json({
            success: false,
            message: "Unable to fetch Account details Please try again",
            error: error.message
        });
    }
}