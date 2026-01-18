import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";
import { User } from "./user.js";

export const UserPreference = sequelize.define(
  "UserPreference",
  {
    user_id: { type: DataTypes.UUID, primaryKey: true },

    home_city: { type: DataTypes.STRING },
    home_lat: { type: DataTypes.DECIMAL(9, 6) },
    home_lng: { type: DataTypes.DECIMAL(9, 6) },
    interests: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    transport_modes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    avg_daily_budget: { type: DataTypes.INTEGER },

    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "UAH",
    },

    theme: {
      type: DataTypes.ENUM("light", "dark", "system"),
      allowNull: false,
      defaultValue: "system",
    },
    language: {
      type: DataTypes.STRING, // en, uk, en-US, uk-UA...
      allowNull: false,
      defaultValue: "en",
    },

    notifications_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notification_channels: {
      type: DataTypes.JSONB, // ["email", "push", "sms"]
      allowNull: false,
      defaultValue: ["email"],
    },
  },
  {
    tableName: "user_preferences",
    timestamps: false,
  },
);

User.hasOne(UserPreference, { foreignKey: "user_id" });
UserPreference.belongsTo(User, { foreignKey: "user_id" });
