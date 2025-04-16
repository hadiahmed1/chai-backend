import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        default: ""
    },
    duration: {
        type: Number,
        required: true,
        default: 0
    },
    views: {
        type: Number,
        required: true,
        default: 0
    },
    isPublished: {
        type: Boolean,
        required: true,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);
const Video = mongoose.model("Video", videoSchema);

export default Video;