import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true
    },

    rating: {
        type: Number,
        default: 5.0
    },
}, 
    {timestamps: true}  
)


const User = mongoose.model("User", UserSchema, "users_collection")
export default User

                      