import app from "./index.js";
import connectDB from "./config/dbConfig.js";

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to connect to database:", err);
});
