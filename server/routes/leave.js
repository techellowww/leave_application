import express from "express";
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

router.post("/", protect, authorize(["admin", "user"]), (req, res) => {
  create(req, res, Leave);
});

router.put("/:id", protect, authorize(["admin", "user"]), (req, res) => {
  update(req, res, Leave);
});

router.get("/", protect, authorize(["admin", "user"]), (req, res) => {
  getAll(req, res, Leave, { createdBy: user._id });
});

router.get("/:id", protect, authorize(["admin", "user"]), (req, res) => {
  getOne(req, res, Leave, { createdBy: user._id });
});

router.delete("/:id", protect, authorize(["admin", "user"]), (req, res) => {
  remove(req, res, Leave);
});

export default router;
