import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import { connectCloudinary } from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import errorHandler from "./middlewares/errorHandler.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

const allowedOrigins = [process.env.ADMIN_URL, process.env.PATIENT_URL];
// middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.PATIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());

// api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server Started at ${port}`);
});
