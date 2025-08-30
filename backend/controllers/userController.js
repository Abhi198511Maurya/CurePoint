import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";
import transporter from "../config/nodemailer.js";
import otpModel from "../models/otpModel.js";

// API to register user
const registerUser = async (req, res) => {
  const { name, email, password, otpCode } = req.body;

  if (!name || !password || !email || !otpCode) {
    return res.json({ success: false, message: "Missing detailes!" });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User Already Exist!" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email!" });
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
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

    if (!otp || otp.verifyOtp !== otpCode || otp.verifyOtp === "") {
      return res.json({ success: false, message: "Verify your otp!" });
    }

    if (otp.verifyOtp === otpCode) {
      newUser.isAccountVerified = true;
      await otp.deleteOne({ email });
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

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not found" });
    }

    if (!user.isAccountVerified) {
      return res.json({ success: false, message: "Verify your email!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("utoken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user logout
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("utoken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "logged out!" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to send OTP
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Missing Details!" });
  }

  if (!validator.isEmail(email)) {
    return res.json({ success: false, message: "Enter a valid email!" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (user) {
      return res.json({ success: false, message: "Account already exists!" });
    }

    if (user?.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified!" });
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));

    const newOtpModel = await otpModel.findOne({ email });

    if (!newOtpModel) {
      await otpModel.create({
        email,
        verifyOtp: otpCode,
        verifyOtpExpireAt: Date.now() + 60 * 60 * 1000,
      });
    } else {
      newOtpModel.verifyOtp = otpCode;
      newOtpModel.verifyOtpExpireAt = Date.now() + 60 * 60 * 1000;
      await newOtpModel.save();
    }

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Account verifycation OTP!",
      text: `Your otp is ${otpCode}. Verify your account using this OTP!`,
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.log(error);

    res.json({ success: false, message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    return res.json({ success: false, message: "Missing Details!" });
  }

  try {
    const otp = await otpModel.findOne({ email });
    if (!otp) {
      return res.json({ success: false, message: "Please send otp!" });
    }

    const user = await userModel.findOne({ email });
    if (user?.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified!" });
    }

    if (otp.verifyOtp !== otpCode || otp.verifyOtp === "") {
      return res.json({ success: false, message: "Invalid OTP!" });
    }

    if (otp.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired!" });
    }

    if (user) {
      user.isAccountVerified = true;
      await user.save();
    }

    return res.json({
      success: true,
      message: "Email verifired successfully!",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = res.locals;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId } = res.locals;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!userId || !name || !phone || !address || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing!" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    res.json({ success: true, message: "Profile Updated!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId } = res.locals;
    const { docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor Not Available!" });
    }

    let slots_booked = docData.slots_booked;

    // cheking fo rslots availablity
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not Availabke!" });
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

    res.json({ success: true, message: "Appointment Booked!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
  try {
    const { userId } = res.locals;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId } = res.locals;
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action!" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e != slotTime,
    );
    if (slots_booked[slotDate].length <= 0) {
      delete slots_booked[slotDate];
    }

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment Cancelled or not found!",
      });
    }

    // creating options for the razorpay
    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    // creation of an order
    const order = await razorpayInstance.orders.create(options);

    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      res.json({ success: true, message: "Payment Successful!" });
    } else {
      res.json({ success: false, message: "Payment faild!" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
};
