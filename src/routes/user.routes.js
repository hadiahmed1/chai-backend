import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post('/register',
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]), registerUser);
userRouter.get('/login', loginUser );
export default userRouter;