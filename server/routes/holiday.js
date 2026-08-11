import express from "express";
import Holiday from "../models/Holiday.js"
import {
  create,
  getAll,
  remove,
  update,
} from "../controllers/common_controllers.js";
import { protect } from "../middleware/auth_middleware.js";
import { authorize } from "../middleware/role_middleware.js";

const router = express.Router();

router.post("/", protect, authorize(["admin"]), (req, res) => {
  create(req, res, Holiday);
});

router.put("/:id", protect, authorize(["admin"]), (req, res) => {
  update(req, res, Holiday);
});

router.get("/", protect, authorize(["admin", "user"]), (req, res) => {
  getAll(req, res, Holiday);
});

router.delete("/:id", protect, authorize(["admin"]), (req, res) => {
  remove(req, res, Holiday);
});

export default router;
