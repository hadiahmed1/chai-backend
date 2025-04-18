import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    channel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    suscriber_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;