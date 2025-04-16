import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("MogoDB connected successfully");
        // console.log("Connection Instance :>>", connection);
    } catch (error) {
        console.log('MongoDB connection FAILED:>>',error);
        process.exit(1);
    }
}

export default connectDB;