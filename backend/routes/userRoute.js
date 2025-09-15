import express from "express";
import multer from "multer";
import {
  bookAppointment,
  cancelAppointment,
  getMe,
  getProfile,
  listAppointment,
  loginUser,
  logoutUser,
  paymentRazorpay,
  registerUser,
  sendOtp,
  updateProfile,
  verifyOtp,
  verifyRazorpay,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import { storage } from "../config/cloudinary.js";

const upload = multer({ storage });

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);

userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);

userRouter.get("/get-profile", authUser, getProfile);
userRouter.get("/me", authUser, getMe);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile,
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

export default userRouter;
