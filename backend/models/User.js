const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        fullName:{
            type: String,
            required: true,
            minlength: 3,
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            select: false
        }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("User", userSchema);