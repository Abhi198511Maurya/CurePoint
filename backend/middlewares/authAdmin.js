import jwt from "jsonwebtoken";
import CustomError from "../utils/CustomError.js";
import AsyncHandler from "../utils/AsyncHandler.js";

// admin authentication middleware
const authAdmin = AsyncHandler(async (req, res, next) => {
  const { atoken } = req.cookies;

  if (!atoken) {
    throw new CustomError(401, "Admin not authorized login again!");
  }
  const tokenDecode = jwt.verify(atoken, process.env.JWT_SECRET);

  if (tokenDecode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
    throw new CustomError(401, "Not authorized login again!");
  }

  next();
});

export default authAdmin;
