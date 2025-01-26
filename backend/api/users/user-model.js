import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        unique: true,
        required: true,
      },
      mobileNo: {
        type: String,
        unique : true,
        required: true,
        index : true,
      },
      password: {
        type: String,
        required: [true, "password is required"],
      },
      avatar: {
        type: String,
      },
      role: 
        {
          type: Schema.Types.ObjectId,
          ref: "Role",
          default : null
        },
      
      refreshToken: {
        type: String,
      },
      isUserDeleted :{
        type : Boolean,
        default : false,
      },
    },
    { timestamps: true }
  );
  
  //This is pre method it is special kind of method in mongoose which is used to perform some action before saving the data in database
  // If the password is not modified, skip hashing
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      return next();
    }
  
    // Hash the password before saving
    try {
      this.password = await bcrypt.hash(this.password, 10);
      next();
    } catch (error) {
      next(error); // Pass error to the next middleware
    }
  });

  
  // decrypt and checking
  userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
  }
  
  // access token which is ticket to communication with the portal (time limited)
  userSchema.methods.generateAccessToken = async function () {
    return jwt.sign({
     _id : this._id,
     name : this.name,
     mobileNo : this.mobileNo,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
  }

  userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
     _id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
  }

export const User = mongoose.model("User", userSchema);
