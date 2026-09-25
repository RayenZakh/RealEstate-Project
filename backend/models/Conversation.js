const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        // The property this conversation is about
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true
        },

        // Exactly two participants: the property owner and the interested user
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],

        // Denormalized last message for efficient inbox display
        lastMessage: {
            type: String,
            default: ""
        },

        lastMessageAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate conversations for the same pair of users on the same property.
// The participants array is always stored in sorted order (see conversationController)
// so this index reliably catches duplicates.
conversationSchema.index({ participants: 1, property: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);
