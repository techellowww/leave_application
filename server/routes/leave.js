import express from "express";
import { Op } from "sequelize";
import Leave from "../models/Leave.js";
import {
  create,
  getAll,
  getOne,
  remove,
  update,
} from "../controllers/common_controllers.js";
import { protect } from "../middleware/auth_middleware.js";
import { authorize } from "../middleware/role_middleware.js";

const router = express.Router();

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

router.post("/", protect, authorize(["admin", "user"]), (req, res) => {
  if (!req.body.employeeId && req.user) {
    req.body.employeeId = req.user.employeeId;
  }
  if (!req.body.assignedTo && req.user) {
    req.body.assignedTo = req.user.employeeId;
  }
  if (!req.body.status) {
    req.body.status = "pending";
  }

  const todayStr = getTodayStr();
  if (req.body.fromDate && req.body.fromDate < todayStr) {
    return res.status(400).json({ message: "From Date cannot be in the past" });
  }

  create(req, res, Leave);
});

router.put("/:id", protect, authorize(["admin", "user"]), async (req, res) => {
  try {
    const existingLeave = await Leave.findByPk(req.params.id);
    if (!existingLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Non-admin users can only edit leave applications when status is pending
    if (req.user.role !== "admin" && existingLeave.status !== "pending") {
      return res.status(400).json({
        message: "Cannot edit a leave request once it has been approved or rejected",
      });
    }

    const todayStr = getTodayStr();
    if (req.body.fromDate && req.body.fromDate < todayStr) {
      return res.status(400).json({ message: "From Date cannot be in the past" });
    }

    update(req, res, Leave);
  } catch (err) {
    console.error("Update leave error:", err);
    res.status(500).json({ message: "internal server error" });
  }
});

router.get("/", protect, authorize(["admin", "user"]), (req, res) => {
  const extraFilter =
    req.user.role === "admin"
      ? {}
      : {
          [Op.or]: [
            { employeeId: req.user.employeeId },
            { assignedTo: req.user.employeeId },
          ],
        };
  getAll(req, res, Leave, extraFilter);
});

router.get("/:id", protect, authorize(["admin", "user"]), (req, res) => {
  const extraFilter =
    req.user.role === "admin"
      ? {}
      : {
          [Op.or]: [
            { employeeId: req.user.employeeId },
            { assignedTo: req.user.employeeId },
          ],
        };
  getOne(req, res, Leave, extraFilter);
});

router.delete("/:id", protect, authorize(["admin", "user"]), async (req, res) => {
  try {
    const existingLeave = await Leave.findByPk(req.params.id);
    if (!existingLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Non-admin users can only delete leave applications when status is pending
    if (req.user.role !== "admin" && existingLeave.status !== "pending") {
      return res.status(400).json({
        message: "Cannot delete a leave request once it has been approved or rejected",
      });
    }

    remove(req, res, Leave);
  } catch (err) {
    console.error("Delete leave error:", err);
    res.status(500).json({ message: "internal server error" });
  }
});

export default router;
