import jwt from "jsonwebtoken";

// User authentication middleware
const authUser = async (req, res, next) => {
  try {
    const { utoken } = req.cookies;
    if (!utoken) {
      return res.json({
        success: false,
        message: "User not authorized login again!",
      });
    }
    const tokenDecode = jwt.verify(utoken, process.env.JWT_SECRET);
    res.locals.userId = tokenDecode.id;

    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
