import app from "../server/index.js";
import connectDB from "../server/config/dbConfig.js";

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
