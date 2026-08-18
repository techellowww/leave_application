import { Op } from "sequelize";
import sequelize from "../config/dbConfig.js";
import User from "../models/Users.js";
import Leave from "../models/Leave.js";
import Holiday from "../models/Holiday.js";

export const leaveSummary = async (req, res) => {
  try {
    const userFilter =
      req.user && req.user.role !== "admin"
        ? { employeeId: req.user.employeeId }
        : {};

    const users = await User.findAll({
      where: userFilter,
      attributes: ["id", "name", "employeeId", "allotedLeaves"],
    });

    const approvedLeaves = await Leave.findAll({
      where: { status: "approved" },
      attributes: [
        "assignedTo",
        [sequelize.fn("SUM", sequelize.col("totalDays")), "takenLeaves"],
      ],
      group: ["assignedTo"],
      raw: true,
    });

    const takenMap = {};
    approvedLeaves.forEach((item) => {
      takenMap[item.assignedTo] = parseFloat(item.takenLeaves || 0);
    });

    const result = users.map((user) => {
      const userObj = user.toJSON();
      const allotedLeaves = userObj.allotedLeaves || 0;
      const takenLeaves = takenMap[userObj.employeeId] || 0;
      const remainingLeaves = Math.max(allotedLeaves - takenLeaves, 0);

      return {
        _id: userObj.id,
        name: userObj.name,
        employeeId: userObj.employeeId,
        allotedLeaves,
        takenLeaves,
        remainingLeaves,
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Leave summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching employee leave list",
    });
  }
};

export const monthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" });
    }

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    const totalDaysInMonth = new Date(yearNum, monthNum, 0).getDate();

    const startStr = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
    const endStr = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(totalDaysInMonth).padStart(2, "0")}`;

    const holidays = await Holiday.findAll({
      where: {
        date: {
          [Op.between]: [startStr, endStr],
        },
      },
    });

    let sundaysCount = 0;
    const sundayDates = new Set();

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const currentDate = new Date(yearNum, monthNum - 1, day);
      if (currentDate.getDay() === 0) {
        sundaysCount++;
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
        const dd = String(currentDate.getDate()).padStart(2, "0");
        sundayDates.add(`${yyyy}-${mm}-${dd}`);
      }
    }

    const holidaysNotOnSunday = holidays.filter((h) => {
      const hDateStr = String(h.date).split("T")[0];
      return !sundayDates.has(hDateStr);
    }).length;

    const totalWorkingDays =
      totalDaysInMonth - sundaysCount - holidaysNotOnSunday;

    res.status(200).json({
      message: "Success",
      data: {
        month: monthNum,
        year: yearNum,
        totalDaysInMonth,
        totalWorkingDays,
        sundays: sundaysCount,
        holidays: holidays.length,
      },
    });
  } catch (error) {
    console.error("Monthly summary error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const dateWiseReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ message: "fromDate and toDate are required" });
    }

    const leaves = await Leave.findAll({
      where: {
        fromDate: {
          [Op.gte]: fromDate,
          [Op.lte]: toDate,
        },
      },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["name"],
        },
      ],
      order: [["fromDate", "ASC"]],
    });

    const data = leaves.map((l) => {
      const leaveObj = l.toJSON();
      return {
        _id: leaveObj.id,
        employeeName: l.employee ? l.employee.name : "",
        employeeId: leaveObj.assignedTo,
        fromDate: leaveObj.fromDate,
        toDate: leaveObj.toDate,
        totalDays: leaveObj.totalDays,
        status: leaveObj.status,
        leaveType: leaveObj.leaveType,
        reason: leaveObj.reason,
      };
    });

    res.status(200).json({ message: "Success", data });
  } catch (error) {
    console.error("Date wise report error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const singleEmployeeReport = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { fromDate, toDate } = req.query;

    const user = await User.findOne({
      where: { employeeId },
      attributes: ["id", "name", "employeeId", "allotedLeaves"],
    });

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const whereConditions = {
      assignedTo: employeeId,
    };

    if (fromDate && toDate) {
      whereConditions.fromDate = {
        [Op.gte]: fromDate,
        [Op.lte]: toDate,
      };
    }

    const leaves = await Leave.findAll({
      where: whereConditions,
      order: [["fromDate", "ASC"]],
    });

    const takenLeaves = leaves
      .filter((l) => l.status === "approved")
      .reduce((sum, l) => sum + parseFloat(l.totalDays || 0), 0);

    const userObj = user.toJSON();

    res.status(200).json({
      message: "Success",
      data: {
        employee: {
          name: userObj.name,
          employeeId: userObj.employeeId,
          allotedLeaves: userObj.allotedLeaves,
          takenLeaves,
          remainingLeaves: Math.max(userObj.allotedLeaves - takenLeaves, 0),
        },
        leaves,
      },
    });
  } catch (error) {
    console.error("Single employee report error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const allEmployeeReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const whereConditions = {};

    if (fromDate && toDate) {
      whereConditions.fromDate = {
        [Op.gte]: fromDate,
        [Op.lte]: toDate,
      };
    }

    const users = await User.findAll({
      attributes: ["id", "name", "employeeId", "allotedLeaves"],
    });

    const leaves = await Leave.findAll({
      where: whereConditions,
      order: [["fromDate", "ASC"]],
    });

    const data = users.map((user) => {
      const userObj = user.toJSON();
      const employeeLeaves = leaves.filter(
        (l) => l.assignedTo === userObj.employeeId,
      );
      const takenLeaves = employeeLeaves
        .filter((l) => l.status === "approved")
        .reduce((sum, l) => sum + parseFloat(l.totalDays || 0), 0);

      return {
        _id: userObj.id,
        name: userObj.name,
        employeeId: userObj.employeeId,
        allotedLeaves: userObj.allotedLeaves,
        takenLeaves,
        remainingLeaves: Math.max(userObj.allotedLeaves - takenLeaves, 0),
        leaves: employeeLeaves,
      };
    });

    res.status(200).json({ message: "Success", data });
  } catch (error) {
    console.error("All employee report error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};
