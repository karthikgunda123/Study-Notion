const Course = require("../models/Course");

const Tag = require("../models/Tags");

const User = require("../models/User");

const {uploadImageToCloudinary} = require("../utils/imageUploader");

// createCourse handler function
exports.createCourse = async (request, response) => {
    try
    {
        // fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = request.body;

        // get thumbnail
        const thumbnail = request.files.thumbnailImage;

        // validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail)
        {
            return response.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // check for instructor
        const userId = request.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: ");

        if (!instructorDetails)
        {
            return response.status(404).json({
                success: false,
                message: "Instructor Details Not Found"
            });
        }

        // check given tag is valid or not
        const tagDetails = await Tag.findById(tag);

        if (!tagDetails)
        {
            return response.status(404).json({
                success: false,
                message: "Tag Details not found"
            });
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create an entry to db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url
        });

        // add the new course to the user schema of Instructor
        await User.findByIdAndUpdate({_id: instructorDetails._id}, {
            $push:{
                courses: newCourse._id
            }
        }, {new: true});

        // update the tag ki schema

        //return response
        return response.status(200).json({
            success: true,
            message: "Course created Successfully"
        });
    }
    catch (error)
    {
        console.log(error);
        return response.status(404).json({
            success: false,
            message: "Failed to create course",
            error: error.message
        });
    }
}

// show All Courses
exports.showAllCourses = async (request, response) => {
    try
    {
        const allCourses = await Course.find({}).populate("instructor").exec();

        return response.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses
        });

    }
    catch (error)
    {
        console.log(error);
        return response.status(404).json({
            success: false,
            message: "Failed to create course",
            error: error.message
        });
    }
}