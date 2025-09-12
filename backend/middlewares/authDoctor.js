import jwt from "jsonwebtoken";
import CustomError from "../utils/CustomError.js";
import AsyncHandler from "../utils/AsyncHandler.js";

// Doctor authentication middleware
const authDoctor = AsyncHandler(async (req, res, next) => {
  const { dtoken } = req.cookies;

  if (!dtoken) {
    throw new CustomError(401, "Doctor not authorized login again!");
  }
  const tokenDecode = jwt.verify(dtoken, process.env.JWT_SECRET);
  res.locals.docId = tokenDecode.id;

  next();
});

export default authDoctor;
