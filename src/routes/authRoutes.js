import { Router } from "express";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  oauthGoogleIdTokenSchema,
} from "../schemas/authSchemas.js";
import { User } from "../db/models/user.js";
import { Session } from "../db/models/session.js";
import { hash, compare } from "../utils/hash.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from "../services/tokenService.js";
import { createRemoteJWKSet, jwtVerify } from "jose";
import crypto from "crypto";
import { Op } from "sequelize";

const GOOGLE_ISS = ["accounts.google.com", "https://accounts.google.com"];
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

const r = Router();

r.post("/register", validate(registerSchema), async (req, res) => {
  const { email, password, name } = req.body;
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(409).json({ error: "EmailExists" });

  const password_hash = await hash(password);
  const user = await User.create({
    email,
    password_hash,
    name,
    auth_provider: "local",
  });
  const access = signAccessToken({ sub: user.id, email: user.email });
  const refresh = signRefreshToken({ sub: user.id, email: user.email });

  const session = await Session.create({
    user_id: user.id,
    refresh_token_hash: crypto
      .createHash("sha256")
      .update(refresh)
      .digest("hex"),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    user_agent: req.headers["user-agent"] || "",
    ip: req.ip,
  });

  res
    .status(201)
    .json({ user: { id: user.id, email, name }, tokens: { access, refresh } });
});

r.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !user.password_hash)
    return res.status(401).json({ error: "InvalidCredentials" });
  const ok = await compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "InvalidCredentials" });

  const access = signAccessToken({ sub: user.id, email: user.email });
  const refresh = signRefreshToken({ sub: user.id, email: user.email });

  await Session.create({
    user_id: user.id,
    refresh_token_hash: crypto
      .createHash("sha256")
      .update(refresh)
      .digest("hex"),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    user_agent: req.headers["user-agent"] || "",
    ip: req.ip,
  });

  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    tokens: { access, refresh },
  });
});

// POST /v1/auth/oauth/google/idtoken
r.post(
  "/oauth/google/idtoken",
  validate(oauthGoogleIdTokenSchema),
  async (req, res) => {
    try {
      const { id_token } = req.body;

      // 1) Google id_token verification
      const { payload } = await jwtVerify(id_token, JWKS, {
        issuer: GOOGLE_ISS,
        audience: process.env.GOOGLE_CLIENT_ID, // must match CLIENT_ID
      });

      // 2) Create or update user (Google → verified=true)
      let user = await User.findOne({ where: { email: payload.email } });
      if (!user) {
        user = await User.create({
          email: payload.email,
          name: payload.name,
          avatar_url: payload.picture,
          auth_provider: "google",
          is_verified: true,
        });
      } else if (!user.is_verified) {
        await user.update({ is_verified: true });
      }

      // 3) Give tokens (access/refresh) and create session
      const claims = { sub: user.id, email: user.email, verified: true };
      const access = signAccessToken(claims);
      const refresh = signRefreshToken(claims);

      await Session.create({
        user_id: user.id,
        refresh_token_hash: crypto
          .createHash("sha256")
          .update(refresh)
          .digest("hex"),
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        user_agent: req.headers["user-agent"] || "",
        ip: req.ip,
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          is_verified: true,
        },
        tokens: { access, refresh },
      });
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: "InvalidIdToken" });
    }
  }
);

r.post("/refresh", validate(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body;
  let payload;
  try {
    payload = verifyRefresh(refreshToken);
  } catch {
    return res.status(401).json({ error: "InvalidRefresh" });
  }

  const hashHex = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const session = await Session.findOne({
    where: {
      user_id: payload.sub,
      refresh_token_hash: hashHex,
      revoked: false,
      expires_at: { [Op.gt]: new Date() },
    },
  });
  if (!session) return res.status(401).json({ error: "RefreshNotFound" });

  // rotation
  session.revoked = true;
  await session.save();

  const access = signAccessToken({ sub: payload.sub, email: payload.email });
  const newRefresh = signRefreshToken({
    sub: payload.sub,
    email: payload.email,
  });
  await Session.create({
    user_id: payload.sub,
    refresh_token_hash: crypto
      .createHash("sha256")
      .update(newRefresh)
      .digest("hex"),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    user_agent: req.headers["user-agent"] || "",
    ip: req.ip,
  });

  res.json({ tokens: { access, refresh: newRefresh } });
});

r.post("/logout", async (req, res) => {
  const token = req.body?.refreshToken;
  if (!token) return res.status(400).json({ error: "MissingRefresh" });
  const hashHex = crypto.createHash("sha256").update(token).digest("hex");
  await Session.update(
    { revoked: true },
    { where: { refresh_token_hash: hashHex } }
  );
  res.json({ success: true });
});

export default r;
