import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

export const registerUser = asyncHandler(async (req, res) => {
    const {username, email, fullName, password} = req.body;
    const user = new User({username, email, fullName, password});
    console.log(user);
    await user.save();

    res.status(200).json("okay");
});