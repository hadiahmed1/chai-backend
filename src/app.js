import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//routes
import userRouter from "./routes/user.routes.js";


const app = express();

app.use(express.json({limit: "100kb"}));
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

//routes
app.use('/user', userRouter);

export default app;