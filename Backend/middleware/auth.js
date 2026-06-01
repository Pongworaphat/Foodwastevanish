const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret";

module.exports = function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;

    if (!token)
      return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("DECODED TOKEN:", decoded);

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
