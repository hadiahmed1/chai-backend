import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser, logoutUser, refreshTokens, changePassword } from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.post('/register',
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]), registerUser);
userRouter.get('/login', loginUser);
userRouter.post('/logout', verifyJWT, logoutUser);
userRouter.get('/refreshTokens', refreshTokens);
userRouter.put('/changePassword', verifyJWT, changePassword);
export default userRouter;