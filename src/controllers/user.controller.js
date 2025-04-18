import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateAccessAndRefreshToken = (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
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
});

export const refreshTokens = asyncHandler(async (req, res) => {
    try {
        const incommingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!incommingRefreshToken) throw new ApiError(401, "Unauthorized");
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
        if (!user && user.refreshAccesstoken !== incommingRefreshToken) throw ApiError(401, "Unauthorized Access");

        const { accessToken, refreshToken } = generateAccessAndRefreshToken(user);
        await User.findByIdAndUpdate(user._id, {
            refreshToken: refreshToken
        }, { new: true, runValidators: false });

        const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken }, "Tokens refreshed successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Couldn't refresh tokens")
    }
});

export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) throw ApiError(400, "Field mandatory");

    const { _id } = req.user;
    const user = await User.findById(_id).select("password");
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) throw new ApiError(401, "Unauthorized access");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password updated successfully"));
})

export const getUser = asyncHandler(async (req, res) => res.status(200).json(
    new ApiResponse(200, req.user, "User fetched successfully")
));

export const updateUser = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) throw ApiError(400, "All fields are required");
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: { fullName, email }
    }, { new: true });

    return res.status(200).json(new ApiResponse(200, {}, "user updated successfully"));
})

export const changeAvatar = asyncHandler(async (req, res) => {
    const avatarfilePath = req.files?.avatar[0]?.path;
    if (!avatarfilePath) throw new ApiError(400, "Avatar image required");
    const avatar = await uploadOnCloudinary(avatarfilePath);
    if (!avatar.url) throw new ApiError(401, null, "Couldnt upload");

    await User.findByIdAndUpdate(req.user._id, {
        $set: { avatar: avatar.url }
    });

    return res.status(200).json(new ApiResponse(200, avatar, "Avatar Updated successfully"));
})