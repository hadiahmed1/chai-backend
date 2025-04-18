import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser, logoutUser, refreshTokens, changePassword, getUser, updateUser, changeAvatar, getChannelProfile, suscribe } from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.get('/', verifyJWT, getUser);
userRouter.post('/register',
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
      ]), registerUser);
userRouter.get('/login', loginUser);
userRouter.post('/logout', verifyJWT, logoutUser);
userRouter.get('/refreshTokens', refreshTokens);
userRouter.put('/changePassword', verifyJWT, changePassword);
userRouter.put("/update", verifyJWT, updateUser);
userRouter.put("/changeAvatar", upload.fields([{ name: "avatar", maxCount: 1 }]), verifyJWT, changeAvatar);
userRouter.get("/channel/:username", getChannelProfile);
userRouter.post("/suscribe/:channelName", verifyJWT, suscribe);
export default userRouter;