import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import SuccessResponse from "../utils/SuccessResponse.js";
import CustomError from "../utils/CustomError.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const changeAvailablity = AsyncHandler(async (req, res) => {
  const { docId } = req.body;
  const docData = await doctorModel.findById(docId);
  await doctorModel.findByIdAndUpdate(docId, {
    available: !docData.available,
  });
  return SuccessResponse(res, "Availability Changed");
});

const doctorList = AsyncHandler(async (req, res) => {
  const doctors = await doctorModel.find({}).select(["-password", "-email"]);
  return SuccessResponse(res, "Get all doctors!", { doctors });
});

// API for doctor Login
const loginDoctor = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new CustomError(400, "Invalid credentials!");
  }
  const doctor = await doctorModel.findOne({ email });

  const isMatch = await bcrypt.compare(password, doctor.password);

  if (!isMatch) {
    throw new CustomError("Invalid Credentials!");
  }
  const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("dtoken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return SuccessResponse(res, "Doctor loggen in!", { token });
});

const logoutDoctor = AsyncHandler(async (req, res) => {
  res.clearCookie("dtoken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return SuccessResponse(res, "logged out!");
});

const getMe = AsyncHandler(async (req, res) => {
  const token = req.cookies.dtoken;
  if (!token) {
    throw new CustomError(401, "Doctor not authenticated!");
  }
  return SuccessResponse(res, "Get doctor's Info!", { token });
});

// API to get appointments of a doctor
const appointmentsDoctor = AsyncHandler(async (req, res) => {
  const { docId } = res.locals;
  const appointments = await appointmentModel.find({ docId });

  return SuccessResponse(res, "Get doctor's all appointments!", {
    appointments,
  });
});

// API to mark appointments completed for doctor panel
const appointmentComplete = AsyncHandler(async (req, res) => {
  const { docId } = res.locals;
  const { appointmentId } = req.body;
  const apppointmentData = await appointmentModel.findById(appointmentId);

  if (apppointmentData && apppointmentData.docId === docId) {
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCompleted: true,
    });
    return SuccessResponse(res, "Appointment Completed!");
  } else {
    throw new CustomError(400, "Mark Failed!");
  }
});

// API to cancel appointments
const appointmentCancel = AsyncHandler(async (req, res) => {
  const { docId } = res.locals;
  const { appointmentId } = req.body;
  const apppointmentData = await appointmentModel.findById(appointmentId);

  if (apppointmentData && apppointmentData.docId === docId) {
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });
    return SuccessResponse(res, "Appointment Cancelled!");
  } else {
    throw new CustomError(400, "Cancellation Failed!");
  }
});

// API to get the dashboard data for doctor panel
const doctorDashboard = AsyncHandler(async (req, res) => {
  const { docId } = res.locals;

  const appointments = await appointmentModel.find({ docId });
  let earnings = 0;
  appointments.map((item) => {
    if (item.isCompleted || item.payment) {
      earnings += item.amount;
    }
  });

  let parients = [];

  appointments.map((item) => {
    if (!parients.includes(item.userId)) {
      parients.push(item.userId);
    }
  });

  const dashData = {
    earnings,
    appointments: appointments.length,
    parients: parients.length,
    latestAppointments: appointments.reverse().slice(0, 5),
  };

  return SuccessResponse(res, "Get doctor's dashboard data!", { dashData });
});

// API to get doctor profile for doctor panel
const doctorProfile = AsyncHandler(async (req, res) => {
  const { docId } = res.locals;
  const profileData = await doctorModel.findById(docId).select("-password");

  return SuccessResponse(res, "Get doctor's profile data!", { profileData });
});

// API to update doctor profile data from doctor panel
const updateDoctorProfile = AsyncHandler(async (req, res) => {
  const { docId } = res.locals;
  const { fees, address, available } = req.body;

  await doctorModel.findByIdAndUpdate(docId, { fees, address, available });

  return SuccessResponse(res, "Profile Updated");
});

export {
  changeAvailablity,
  doctorList,
  loginDoctor,
  logoutDoctor,
  getMe,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
};
