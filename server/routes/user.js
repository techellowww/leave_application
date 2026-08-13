import express from "express";
import User from "../models/Users.js";
import {
  create,
  getAll,
  getOne,
  remove,
  update,
} from "../controllers/common_controllers.js";
import { login, getMe } from "../controllers/authentication.js";
import { protect } from "../middleware/auth_middleware.js";
import { authorize } from "../middleware/role_middleware.js";

const router = express.Router();

router.post("/login", login);

router.get("/me", protect, getMe);

// router.post("/", protect, authorize(["admin"]), async (req, res) => {
router.post("/", async (req, res) => {
  try {
    const { employeeId, email } = req.body;
    if (employeeId) {
      const existingEmp = await User.findOne({ employeeId: employeeId.trim() });
      if (existingEmp) {
        return res.status(400).json({
          message: `User with Employee ID '${employeeId}' already exists!`,
        });
      }
    }
    if (email) {
      const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          message: `User with Email '${email}' already exists!`,
        });
      }
    }
    create(req, res, User);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "internal server error" });
  }
});

router.put("/:id", protect, authorize(["admin"]), async (req, res) => {
  try {
    const { employeeId, email } = req.body;
    const userId = req.params.id;
    if (employeeId) {
      const existingEmp = await User.findOne({
        employeeId: employeeId.trim(),
        _id: { $ne: userId },
      });
      if (existingEmp) {
        return res.status(400).json({
          message: `User with Employee ID '${employeeId}' already exists!`,
        });
      }
    }
    if (email) {
      const existingEmail = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: userId },
      });
      if (existingEmail) {
        return res.status(400).json({
          message: `User with Email '${email}' already exists!`,
        });
      }
    }
    update(req, res, User);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "internal server error" });
  }
});

router.get("/", protect, authorize(["admin", "user"]), (req, res) => {
  getAll(req, res, User);
});

router.get("/:id", protect, authorize(["admin", "user"]), (req, res) => {
  getOne(req, res, User);
});

router.delete("/:id", protect, authorize(["admin"]), (req, res) => {
  remove(req, res, User);
});

export default router;
