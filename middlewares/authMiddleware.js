import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateToken = (req, res, next) => {
  console.log(req.headers["authorization"]);
  const token = req.headers["authorization"].split(" ");
  console.log(token);

  if (!token) return res.status(401).json({ error: "Token not found" });
  if (token[0] !== "Bearer")
    return res.status(403).json({ error: "Invalid token struct" });

  jwt.verify(token[1], process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};
