import jwt from "jsonwebtoken";
import fs from "fs";

const ALG = process.env.JWT_ALG || "HS256";

let signOptions = { algorithm: ALG };
let verifyOptions = { algorithms: [ALG] };
let accessKey, refreshKey, accessPub, refreshPub;

if (ALG === "RS256") {
  accessKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH, "utf8");
  accessPub = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH, "utf8");
  // refresh can be done with the same key or a different one
  refreshKey = accessKey;
  refreshPub = accessPub;
} else {
  accessKey = refreshKey = process.env.JWT_SECRET || "dev-secret";
  accessPub = refreshPub = accessKey;
}

export function signAccessToken(payload) {
  return jwt.sign(payload, accessKey, {
    ...signOptions,
    expiresIn: process.env.ACCESS_TOKEN_TTL || "15m",
  });
}
export function signRefreshToken(payload) {
  return jwt.sign(payload, refreshKey, {
    ...signOptions,
    expiresIn: process.env.REFRESH_TOKEN_TTL || "30d",
  });
}
export function verifyAccess(token) {
  return jwt.verify(token, accessPub, verifyOptions);
}
export function verifyRefresh(token) {
  return jwt.verify(token, refreshPub, verifyOptions);
}
