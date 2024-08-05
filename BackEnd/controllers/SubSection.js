const SubSection = require("../models/SubSection");

const Section = require("../models/Section");

const {uploadImageToCloudinary} = require("../utils/imageUploader");

require("dotenv").config();

exports.createSubSection = async (request, response) => {
    try
    {
        // fetch data from req.body
        const {sectionId, title, timeDuration, description} = request.body;

        // extract file body
        const video = request.files.videoFile;

        // validation
        if (!sectionId || !title || !timeDuration || !description || !video)
        {
            return response.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // upload video in cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // create a subsection
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url
        });

        // update section with this subsection ObjectID
        const updatedSection = await Section.findByIdAndUpdate({_id: sectionId}, {
            $push:{
                subSection: SubSectionDetails._id
            }
        }, {new: true});

        // HW: log updated section here, after adding populated query
        // return response
        return response.status(200).json({
            success: true,
            message: "SubSection created successfully",
            SubSectionDetails
        });
    }
    catch(error)
    {
        return response.status(500).json({
            success: false,
            message: "Unable to create Sub-Section Please try again",
            error: error.message
        });
    }
}

 // HW: updateSubSection

// HW: deleteSubSection