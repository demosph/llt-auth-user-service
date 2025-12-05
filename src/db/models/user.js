import { DataTypes, UUIDV4 } from "sequelize";
import { sequelize } from "../index.js";

export const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING }, // nullable for GIS
    name: { type: DataTypes.STRING },
    avatar_url: { type: DataTypes.STRING },
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
