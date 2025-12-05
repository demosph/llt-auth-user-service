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
    interests: { type: DataTypes.JSONB },
    transport_modes: { type: DataTypes.JSONB },
    avg_daily_budget: { type: DataTypes.INTEGER },
  },
  {
    tableName: "user_preferences",
    timestamps: false,
  }
);

User.hasOne(UserPreference, { foreignKey: "user_id" });
UserPreference.belongsTo(User, { foreignKey: "user_id" });
