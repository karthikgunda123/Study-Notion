const Section = require("../models/Section");

const Course = require("../models/Course");

exports.createSection = async (request, response) =>{
    try
    {
        // data fetch
        const {sectionName, courseId} = request.body;

        // data validation
        if (!sectionName || !courseId)
        {
            return response.status(400).json({
                success: false,
                message: "Missing Properties"
            });
        }

        // create section
        const newSection = await Section.create({sectionName});

        // update course with section ObjectID
        const updatedCourse = await Course.findByIdAndUpdate(courseId, {
            $push:{
                courseContent: newSection._id
            }
        }, {new: true});

        // HW: use populate to replace sections/subsections both in the updatedCourseDetails
        // return response
        return response.status(200).json({
            success: true,
            message: "Section created successfully"
        });
    }
    catch (error)
    {
        return response.status(500).json({
            success: false,
            message: "Unable to create Section Please try again",
            error: error.message
        });
    }
}

exports.updateSection = async (request, response) => {
    try
    {
        // data input
        const {sectionName, sectionId} = request.body;

        // data validation
        if (!sectionName || !sectionId)
        {
            return response.status(400).json({
                success: false,
                message: "Missing Properties"
            });
        }

        // update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true});

        // return json
        return response.status(200).json({
            success: true,
            message: "Section Updated successfully"
        });
    }
    catch (error)
    {
        return response.status(500).json({
            success: false,
            message: "Unable to update Section Please try again",
            error: error.message
        });
    }
}

exports.deleteSection = async (request, response) => {
    try
    {
        // get Id - assuming that we are sending ID in params
        const {sectionId} = request.params;

        // use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);

        //  TODO: do we also need to delete id in Course model

        // return response
        return response.status(200).json({
            success: true,
            message: "Section Deleted successfully"
        });
    }
    catch (error)
    {
        return response.status(500).json({
            success: false,
            message: "Unable to delete Section Please try again",
            error: error.message
        });
    }
}