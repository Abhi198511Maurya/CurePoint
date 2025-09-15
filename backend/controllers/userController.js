import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";
import transporter from "../config/nodemailer.js";
import otpModel from "../models/otpModel.js";
import CustomError from "../utils/CustomError.js";
import SuccessResponse from "../utils/SuccessResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

// API to register user
const registerUser = AsyncHandler(async (req, res) => {
  const { name, email, password, otpCode } = req.body;

  if (!name || !password || !email || !otpCode) {
    throw new CustomError(400, "Missing detailes!");
  }

  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    throw new CustomError(409, "User Already Exist!");
  }

  if (!validator.isEmail(email)) {
    throw new CustomError(400, "Enter a valid email!");
  }

  // validating strong password
  if (password.length < 8) {
    throw new CustomError(400, "Enter a strong password!");
  }

  // Hashing user password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userdata = {
    name,
    email,
    password: hashedPassword,
  };

  const newUser = new userModel(userdata);

  const otp = await otpModel.findOne({ email });

  if (!otp) {
    throw new CustomError(400, "Verify your email!");
  }

  if (otp.verifyOtp === otpCode && otp.isVerified) {
    newUser.isAccountVerified = true;
    await otp.deleteOne({ email });
  } else {
    throw new CustomError(400, "Verify your otp!");
  }

  const user = await newUser.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("utoken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return SuccessResponse(res, "User registered!", { token });
});

// API for user login
const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError(400, "Missing details!");
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    throw new CustomError(404, "User does not found!");
  }

  if (!user.isAccountVerified) {
    throw new CustomError(403, "Verify your email!");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new CustomError(400, "Invalid credentials!");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("utoken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return SuccessResponse(res, "User logged in!", { token });
});

// API for user logout
const logoutUser = AsyncHandler(async (req, res) => {
  res.clearCookie("utoken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return SuccessResponse(res, "User logged out!");
});

// API to send OTP
const sendOtp = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError(400, "Missing Details!");
  }

  if (!validator.isEmail(email)) {
    throw new CustomError(400, "Enter a valid email!");
  }

  const user = await userModel.findOne({ email });

  if (user) {
    throw new CustomError(409, "Account already exists!");
  }

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));

  const otp = await otpModel.findOne({ email });

  if (otp) {
    otp.verifyOtp = otpCode;
    otp.verifyOtpExpireAt = Date.now() + 60 * 1000;
    otp.isVerified = false;
    await otp.save();
  } else {
    await otpModel.create({
      email,
      verifyOtp: otpCode,
      verifyOtpExpireAt: Date.now() + 60 * 1000,
    });
  }

  const mailOption = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Account verification OTP!",
    text: `Your otp is ${otpCode}. Verify your account using this OTP!`,
  };

  await transporter.sendMail(mailOption);

  return SuccessResponse(res, "OTP sent successfully!");
});

const verifyOtp = AsyncHandler(async (req, res) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    throw new CustomError(400, "Missing Details!");
  }

  const otp = await otpModel.findOne({ email });
  if (!otp) {
    throw new CustomError(404, "Please send otp!");
  }

  if (otp.verifyOtp !== otpCode || otp.verifyOtp === "") {
    throw new CustomError(400, "Invalid OTP!");
  }

  if (otp.verifyOtpExpireAt < Date.now() && !otp.isVerified) {
    throw new CustomError(400, "OTP expired!");
  }

  otp.isVerified = true;
  await otp.save();

  return SuccessResponse(res, "Email verifired successfully!");
});

// API to get user profile data
const getProfile = AsyncHandler(async (req, res) => {
  const { userId } = res.locals;
  const userData = await userModel.findById(userId).select("-password");

  return SuccessResponse(res, "Get user's profile data!", { userData });
});

const getMe = AsyncHandler(async (req, res) => {
  const token = req.cookies.utoken;
  if (!token) {
    throw new CustomError(401, "User not authenticated!");
  }
  return SuccessResponse(res, "Get user's Info!", { token });
});

// API to update user profile
const updateProfile = AsyncHandler(async (req, res) => {
  const { userId } = res.locals;
  const { name, phone, address, dob, gender } = req.body;
  const imageFile = req.file;

  if (!userId || !name || !phone || !address || !dob || !gender) {
    throw new CustomError(400, "Data Missing!");
  }

  await userModel.findByIdAndUpdate(userId, {
    name,
    phone,
    address: JSON.parse(address),
    dob,
    gender,
  });

  if (imageFile) {
    await userModel.findByIdAndUpdate(userId, { image: imageFile.path });
  }

  return SuccessResponse(res, "Profile Updated!");
});

// API to book appointment
const bookAppointment = AsyncHandler(async (req, res) => {
  const { userId } = res.locals;
  const { docId, slotDate, slotTime } = req.body;

  const docData = await doctorModel.findById(docId).select("-password");

  if (!docData.available) {
    throw new CustomError(403, "Doctor Not Available!");
  }

  let slots_booked = docData.slots_booked;

  // cheking fo rslots availablity
  if (slots_booked[slotDate]) {
    if (slots_booked[slotDate].includes(slotTime)) {
      throw new CustomError(403, "Slot not Availabke!");
    } else {
      slots_booked[slotDate].push(slotTime);
    }
  } else {
    slots_booked[slotDate] = [];
    slots_booked[slotDate].push(slotTime);
  }

  const userData = await userModel.findById(userId).select("-password");

  delete docData.slots_booked;

  const appointmentData = {
    userId,
    docId,
    userData,
    docData,
    amount: docData.fees,
    slotTime,
    slotDate,
    date: Date.now(),
  };

  const newAppointment = new appointmentModel(appointmentData);

  await newAppointment.save();

  // save new slots data in doctors data
  await doctorModel.findByIdAndUpdate(docId, { slots_booked });

  return SuccessResponse(res, "Appointment Booked!");
});

// API to get user appointments for frontend my-appointments page
const listAppointment = AsyncHandler(async (req, res) => {
  const { userId } = res.locals;
  const appointments = await appointmentModel.find({ userId });

  return SuccessResponse(res, "Get user's appointments!", { appointments });
});

// API to cancel appointment
const cancelAppointment = AsyncHandler(async (req, res) => {
  const { userId } = res.locals;
  const { appointmentId } = req.body;
  const appointmentData = await appointmentModel.findById(appointmentId);

  // verify appointment user
  if (appointmentData.userId !== userId) {
    throw new CustomError(401, "Unauthorized action!");
  }

  await appointmentModel.findByIdAndUpdate(appointmentId, {
    cancelled: true,
  });

  // releasing doctor slot
  const { docId, slotDate, slotTime } = appointmentData;

  const doctorData = await doctorModel.findById(docId);

  let slots_booked = doctorData.slots_booked;

  slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e != slotTime);
  if (slots_booked[slotDate].length <= 0) {
    delete slots_booked[slotDate];
  }

  await doctorModel.findByIdAndUpdate(docId, { slots_booked });

  return SuccessResponse(res, "Appointment Cancelled!");
});

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API to make payment of appointment using razorpay
const paymentRazorpay = AsyncHandler(async (req, res) => {
  const { appointmentId } = req.body;
  const appointmentData = await appointmentModel.findById(appointmentId);
  if (!appointmentData || appointmentData.cancelled) {
    throw new CustomError(404, "Appointment Cancelled or not found!");
  }

  // creating options for the razorpay
  const options = {
    amount: appointmentData.amount * 100,
    currency: process.env.CURRENCY,
    receipt: appointmentId,
  };

  // creation of an order
  const order = await razorpayInstance.orders.create(options);

  return SuccessResponse(res, "Razorpay Payment order!", { order });
});

// API to verify payment of razorpay
const verifyRazorpay = AsyncHandler(async (req, res) => {
  const { razorpay_order_id } = req.body;
  const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

  if (orderInfo.status === "paid") {
    await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
      payment: true,
    });
    return SuccessResponse(res, "Payment Successful!");
  } else {
    throw new CustomError(422, "Payment faild!");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  sendOtp,
  verifyOtp,
  getProfile,
  getMe,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
};
