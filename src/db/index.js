import { Sequelize } from "sequelize";

const {
  DB_HOST,
  DB_PORT,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  NODE_ENV,
} = process.env;

export const sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT || 5432),
  dialect: "postgres",
  logging: NODE_ENV === "development" ? console.log : false,
  define: { underscored: true },
});
