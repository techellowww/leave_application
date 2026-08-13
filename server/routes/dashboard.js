import express from "express";
import {
  leaveSummary,
  monthlySummary,
  dateWiseReport,
  singleEmployeeReport,
  allEmployeeReport,
} from "../controllers/dashboard_controller.js";
import { protect } from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/leave-summary", protect, leaveSummary);
router.get("/monthly-summary", monthlySummary);
router.get("/report/date-wise", dateWiseReport);
router.get("/report/employee/:employeeId", singleEmployeeReport);
router.get("/report/all-employees", allEmployeeReport);

export default router;
