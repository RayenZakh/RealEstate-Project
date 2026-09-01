const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true
        },

        listingType: {
            type: String,
            enum: ["sale", "rent"],
            required: true
        },

        propertyType: {
            type: String,
            enum: ["house", "apartment", "villa", "land"],
            required: true
        },

        bedrooms: {
            type: Number,
            default: 0
        },

        bathrooms: {
            type: Number,
            default: 0
        },

        area: {
            type: Number,
            required: true
        },

        location: {
            city: {
                type: String,
                required: true
            },

            latitude: {
                type: Number,
                required: true
            },

            longitude: {
                type: Number,
                required: true
            }
        },

        images: {
            type: [String],
            default: []
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Property", propertySchema);