const Tag = require("../models/Tags");

// create Tag ka handler function

exports.createTag = async (request, response) => {
    try
    {
        // fetch data
        const {name, description} = request.body;

        // validation
        if (!name || !description)
        {
            return response.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // create entry in DB
        const tagDetails = await Tag.create({
            name: name,
            description: description
        });
        console.log(tagDetails);

        //return response
        return response.status(200).json({
            success: true,
            message: "Tag Created Successfully"
        });
    }
    catch (error)
    {
        return response.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// getAllTags handler function

exports.showAllTags = async (request, response) => {
    try
    {
        const allTags = await Tag.find({}, {name: true, description: true});

        return response.status(200).json({
            success: true,
            message: "All Tags returned successfully",
            allTags
        });
    }
    catch (error)
    {
        return response.status(500).json({
            success: false,
            message: error.message
        });
    }
}