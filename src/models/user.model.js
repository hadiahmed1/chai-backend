import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    }],
    refreshToken: {
        type: String,
        select: false
    },
    avatar: {
        type: String,
        unique: true,
        // required: true
    },
    coverImage: {
        type: String,
    }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (this.isModified("password"))
        this.password = bcrypt.hashSync(this.password, 10);
    next();
})
userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compareSync(password, this.password);
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, fullName: this.fullName },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}




const User = mongoose.model("User", userSchema);

export default User;