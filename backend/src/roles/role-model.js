import mongoose, { Schema } from "mongoose";

const roleSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true, // Ensure role names are unique
        },
        sections: [
            {
                module: {
                    type: Schema.Types.ObjectId,
                    ref: "Module",
                    default: null,
                },  
                permission: {
                    type: Number,
                    default: 0,
                    validate: {
                        validator: (value) => value >= 0,
                        message: "Permission must be a non-negative number",
                    },
                },
                
            },
        ],
        isRoleDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);



export const Role = mongoose.model("Role", roleSchema);
