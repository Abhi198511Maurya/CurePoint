import jwt from "jsonwebtoken";
import CustomError from "../utils/CustomError.js";
import AsyncHandler from "../utils/asyncHandler.js";

// User authentication middleware
const authUser = AsyncHandler(async (req, res, next) => {
  const { utoken } = req.cookies;
  if (!utoken) {
    throw new CustomError(401, "User not authorized login again!");
  }
  const tokenDecode = jwt.verify(utoken, process.env.JWT_SECRET);
  res.locals.userId = tokenDecode.id;

  next();
});

export default authUser;
