import jwt from "jsonwebtoken";

// Doctor authentication middleware
const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.cookies;

    if (!dtoken) {
      return res.json({
        success: false,
        message: "Doctor not authorized login again!",
      });
    }
    const tokenDecode = jwt.verify(dtoken, process.env.JWT_SECRET);
    res.locals.docId = tokenDecode.id;

    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
