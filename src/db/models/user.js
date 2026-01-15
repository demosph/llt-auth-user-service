import { DataTypes, UUIDV4 } from "sequelize";
import { sequelize } from "../index.js";

const DEFAULT_AVATAR_URL =
  process.env.DEFAULT_AVATAR_URL || "/src/assets/img/default-avatar.jpg";

export const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING }, // nullable for GIS
    name: { type: DataTypes.STRING },

    avatar_url: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: DEFAULT_AVATAR_URL,
    },

    plan: {
      type: DataTypes.ENUM("Explorer", "Nomad", "Globetrotter"),
      allowNull: false,
      defaultValue: "Explorer",
    },

    auth_provider: {
      type: DataTypes.ENUM("local", "google"),
      allowNull: false,
      defaultValue: "local",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);
