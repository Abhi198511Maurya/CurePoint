import validator from "validator";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import CustomError from "../utils/CustomError.js";
import SuccessResponse from "../utils/SuccessResponse.js";
import AsyncHandler from "../utils/asyncHandler.js";

// API for adding doctor
const addDoctor = AsyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    speciality,
    degree,
    experience,
    about,
    fees,
    address,
  } = req.body;
  const imageFile = req.file;

  // Checking for all data to add doctor
  if (
    !name ||
    !email ||
    !password ||
    !speciality ||
    !degree ||
    !experience ||
    !about ||
    !fees ||
    !address
  ) {
    throw new CustomError(400, "Missing Details!");
  }

  // validating email formates
  if (!validator.isEmail(email)) {
    throw new CustomError(401, "Please enter a valid email!");
  }

  // Validating strong password
  if (password.length < 8) {
    throw new CustomError(401, "Please enter a strong password!");
  }

  // hasing doctor password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const doctorData = {
    name,
    email,
    image: imageFile.path,
    password: hashedPassword,
    speciality,
    degree,
    experience,
    about,
    fees,
    address: JSON.parse(address),
    date: Date.now(),
  };

  const newDoctor = new doctorModel(doctorData);
  await newDoctor.save();

  return SuccessResponse(res, "Doctor added");
});

// API for the admin login
const loginAdmin = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(email + password, process.env.JWT_SECRET);

    res.cookie("atoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return SuccessResponse(res, "Admin loggen in!", { token });
  } else {
    throw new CustomError(401, "Invalid credentials");
  }
});

const logoutAdmin = AsyncHandler(async (req, res) => {
  res.clearCookie("atoken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return SuccessResponse(res, "logged out!");
});

// API to get all doctors list for admin panel
const allDoctors = AsyncHandler(async (req, res) => {
  const doctors = await doctorModel.find({}).select("-password");
  return SuccessResponse(res, "Get all doctors!", { doctors });
});

// API to get all appointments list
const appointmentsAdmin = AsyncHandler(async (req, res) => {
  const appointments = await appointmentModel.find({});
  return SuccessResponse(res, "Get all appointments!", { appointments });
});

// API for appointments cancilation
const appointmentCancel = AsyncHandler(async (req, res) => {
  const { appointmentId } = req.body;
  const appointmentData = await appointmentModel.findById(appointmentId);

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

// API to dashboard data for admin panel
const adminDashboard = AsyncHandler(async (req, res) => {
  const doctors = await doctorModel.find({});
  const users = await userModel.find({});
  const appointments = await appointmentModel.find({});

  const dashData = {
    doctors: doctors.length,
    appointments: appointments.length,
    patients: users.length,
    latestAppointments: appointments.reverse().slice(0, 5),
  };

  return SuccessResponse(res, "Get admin's dashboard data!", { dashData });
});

export {
  addDoctor,
  loginAdmin,
  logoutAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
};
