import { DataTypes, UUIDV4 } from "sequelize";
import { sequelize } from "../index.js";
import { User } from "./user.js";

export const Session = sequelize.define(
  "Session",
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
    user_id: { type: DataTypes.UUID, allowNull: false },
    refresh_token_hash: { type: DataTypes.STRING, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    user_agent: { type: DataTypes.STRING },
    ip: { type: DataTypes.STRING },
    revoked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    tableName: "sessions",
    timestamps: false,
  }
);

User.hasMany(Session, { foreignKey: "user_id" });
Session.belongsTo(User, { foreignKey: "user_id" });
