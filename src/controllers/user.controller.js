import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
    //getting user details
    const { username, email, fullName, password } = req.body;
    //checking if empty
    if ([username, email, fullName, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "Some fields are missing");
    }
    //check if exists
    const oldUser = await User.findOne({ $or: [{ email }, { username }] });
    if (oldUser) throw new ApiError(409, "User already exists");
    //files
    const avatarfilePath = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.avatar[0]?.path;
    if (!avatarfilePath) throw new ApiError(400, "Avatar image required");

    const avatar = await uploadOnCloudinary(avatarfilePath);
    const coverImage = (coverImagePath) ? await uploadOnCloudinary(coverImagePath) : null;
    if (!avatar) throw new ApiError("401", null,"Couldnt upload");

    const user = new User({
        username, email, fullName, password,
        avatar: avatar.url, coverImage: coverImage?.url || ""
    });
    await user.save();

    res.status(200).json(new ApiResponse(200, user, "User created successfully"))

});