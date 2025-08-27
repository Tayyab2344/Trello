import jwt from "jsonwebtoken";

export const authentication = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(403).json({ message: "token is not valid" });
  }
  jwt.verify(token, process.env.JWT_KEY, (err, decoder) => {
    if (err) {
      return res.status(403).json({
        message:
          err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
      });
    }
    req.user = decoder;
    next();
  });
};
