import { verifyAccess } from "../services/tokenService.js";

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = verifyAccess(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role || "user",
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
