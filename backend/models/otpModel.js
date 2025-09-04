import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
});

const otpModel = mongoose.models.otpSchema || mongoose.model("Otp", otpSchema);

export default otpModel;
