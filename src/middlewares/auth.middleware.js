import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!accessToken) throw new ApiError(401, "Unauthorized");
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = User.findById(decodedToken?._id);
        if (!user) throw new ApiError(401, "Unauthorized");
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Token")
    }
})

export default verifyJWT;