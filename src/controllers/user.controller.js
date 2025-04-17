import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateAccessToken();
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Couldn't generate tokens");
    }
}

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
    let coverImagePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
        coverImagePath = req.files?.coverImage[0]?.path;
    if (!avatarfilePath) throw new ApiError(400, "Avatar image required");

    const avatar = await uploadOnCloudinary(avatarfilePath);
    const coverImage = (coverImagePath) ? await uploadOnCloudinary(coverImagePath) : null;
    if (!avatar) throw new ApiError("401", null, "Couldnt upload");

    const user = new User({
        username, email, fullName, password,
        avatar: avatar.url, coverImage: coverImage?.url || ""
    });
    await user.save();

    res.status(200).json(new ApiResponse(200, user, "User created successfully"))

});

export const loginUser = asyncHandler(async (req, res) => {
    //get email and password
    const { email, username, password } = req.body;
    if (!username && !password) throw new ApiError(400, "Please enter username or password");
    //get corresponding user
    const user = await User.findOne({ $or: [{ email }, { username }] }).select("password");
    if (!user) throw new ApiError(404, "User not found");
    //match password
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) throw new ApiError(401, "Inavalid credentials");
    //generate and return access and refreshToken (COOKIES)
    const options = {
        httpOnly: true,
        secure: true
    }
    const { accessToken, refreshToken } = generateAccessAndRefreshToken(user);
    // res.status(200).json(new ApiResponse(200, generateAccessAndRefreshToken(user), "loggin successfull"));
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user, accessToken, refreshToken }, "User loggin successfull"));

})

//protected routes ->will have access to req.user
export const logoutUser = asyncHandler(async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } }, { new: true });
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logout successfull"));
})