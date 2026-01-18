import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { patchMeSchema, patchPrefsSchema } from "../schemas/userSchemas.js";
import { User } from "../db/models/user.js";
import { UserPreference } from "../db/models/userPreference.js";

const r = Router();

r.get("/me", requireAuth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    plan: user.plan,
    auth_provider: user.auth_provider,
  });
});

r.patch("/me", requireAuth, validate(patchMeSchema), async (req, res) => {
  const user = await User.findByPk(req.user.id);
  await user.update({ ...req.body });
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    plan: user.plan,
  });
});

r.get("/me/preferences", requireAuth, async (req, res) => {
  const prefs = await UserPreference.findByPk(req.user.id);

  if (!prefs) {
    // Return defaults (aligned with model defaults)
    return res.json({
      theme: "system",
      language: "en",
      notifications_enabled: false,
      notification_channels: ["email"],
      interests: [],
      transport_modes: [],
    });
  }

  const p = prefs.toJSON();
  // optionally hide user_id from response
  delete p.user_id;

  res.json(p);
});

r.patch(
  "/me/preferences",
  requireAuth,
  validate(patchPrefsSchema),
  async (req, res) => {
    let prefs = await UserPreference.findByPk(req.user.id);

    const defaults = {
      theme: "system",
      language: "en",
      notifications_enabled: true,
      notification_channels: ["email"],
      interests: [],
      transport_modes: [],
      home_city: null,
      home_lat: null,
      home_lng: null,
      avg_daily_budget: null,
    };

    if (!prefs) {
      prefs = await UserPreference.create({
        user_id: req.user.id,
        ...defaults,
      });
    }

    const patch = { ...req.body };

    // if notifications_enabled=false — clear notification_channels
    if (patch.notifications_enabled === false) {
      patch.notification_channels = [];
    }

    await prefs.update(patch);

    const p = prefs.toJSON();
    delete p.user_id;
    res.json(p);
  },
);

export default r;
