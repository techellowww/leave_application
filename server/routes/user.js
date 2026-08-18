import express from "express";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
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

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const indianMobileRegex = /^(?:\+91[\-\s]?|0)?[6-9]\d{9}$/;

// Create user
router.post("/", async (req, res) => {
  try {
    const { employeeId, email, password, mobileNumber } = req.body;

    if (employeeId) {
      const existingEmp = await User.findOne({
        where: { employeeId: employeeId.trim() },
      });
      if (existingEmp) {
        return res.status(400).json({
          message: `User with Employee ID '${employeeId}' already exists!`,
        });
      }
      req.body.employeeId = employeeId.trim();
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          message: "Please enter a valid email address (e.g. user@company.com)",
        });
      }
      const existingEmail = await User.findOne({
        where: { email: normalizedEmail },
      });
      if (existingEmail) {
        return res.status(400).json({
          message: `User with Email '${email}' already exists!`,
        });
      }
      req.body.email = normalizedEmail;
    }

    if (mobileNumber) {
      const cleanMobile = mobileNumber.trim();
      if (!indianMobileRegex.test(cleanMobile)) {
        return res.status(400).json({
          message: "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +919876543210)",
        });
      }
      req.body.mobileNumber = cleanMobile;
    }

    if (password && password.trim() !== "") {
      req.body.password = password.trim();
    }

    create(req, res, User);
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "internal server error" });
  }
});

// Update user
router.put("/:id", protect, authorize(["admin"]), async (req, res) => {
  try {
    const { employeeId, email, password, mobileNumber } = req.body;
    const userId = req.params.id;

    if (employeeId) {
      const existingEmp = await User.findOne({
        where: {
          employeeId: employeeId.trim(),
          id: { [Op.ne]: userId },
        },
      });
      if (existingEmp) {
        return res.status(400).json({
          message: `User with Employee ID '${employeeId}' already exists!`,
        });
      }
      req.body.employeeId = employeeId.trim();
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          message: "Please enter a valid email address (e.g. user@company.com)",
        });
      }
      const existingEmail = await User.findOne({
        where: {
          email: normalizedEmail,
          id: { [Op.ne]: userId },
        },
      });
      if (existingEmail) {
        return res.status(400).json({
          message: `User with Email '${email}' already exists!`,
        });
      }
      req.body.email = normalizedEmail;
    }

    if (mobileNumber) {
      const cleanMobile = mobileNumber.trim();
      if (!indianMobileRegex.test(cleanMobile)) {
        return res.status(400).json({
          message: "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +919876543210)",
        });
      }
      req.body.mobileNumber = cleanMobile;
    }

    if (password && password.trim() !== "") {
      req.body.password = password.trim();
    } else {
      delete req.body.password;
    }

    update(req, res, User);
  } catch (err) {
    console.error("Update user error:", err);
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
