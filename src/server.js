import "dotenv/config";
import { sequelize } from "./db/index.js";
import { createApp } from "./app.js";

const port = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.sync(); // for MVP; in production, use migrations
    const app = createApp();
    app.listen(port, () => console.log(`Auth service on :${port}`));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
