import express from "express";
import User from "../models/Users.js";
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

router.post("/", protect, authorize(["admin"]), (req, res) => {
  create(req, res, User);
});

router.put("/:id", protect, authorize(["admin"]), (req, res) => {
  update(req, res, User);
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
