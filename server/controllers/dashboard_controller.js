import User from "../models/Users.js";
import Leave from "../models/Leave.js";

export const leaveSummary = async (req, res) => {
  try {
    const users = await User.find().select("name employeeId allotedLeaves");

    const approvedLeaves = await Leave.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$assignedTo",
          takenLeaves: { $sum: "$totalDays" },
        },
      },
    ]);

    const takenMap = {};
    approvedLeaves.forEach((item) => {
      takenMap[item._id] = item.takenLeaves;
    });

    const result = users.map((user) => {
      const allotedLeaves = user.allotedLeaves || 0;
      const takenLeaves = takenMap[user.employeeId] || 0;
      const remainingLeaves = allotedLeaves - takenLeaves;

      return {
        _id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        allotedLeaves,
        takenLeaves,
        remainingLeaves: remainingLeaves < 0 ? 0 : remainingLeaves,
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
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

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const totalDaysInMonth = new Date(yearNum, monthNum, 0).getDate();

    const start = new Date(yearNum, monthNum - 1, 1);
    const end = new Date(yearNum, monthNum, 0, 23, 59, 59);
    const holidays = await Holiday.find({ date: { $gte: start, $lte: end } });

    let sundaysCount = 0;
    const sundayDates = new Set();

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const currentDate = new Date(yearNum, monthNum - 1, day);
      if (currentDate.getDay() === 0) {
        sundaysCount++;
        sundayDates.add(currentDate.toDateString());
      }
    }

    const holidaysNotOnSunday = holidays.filter(
      (h) => !sundayDates.has(new Date(h.date).toDateString()),
    ).length;

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
    console.log(error);
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

    const data = await Leave.aggregate([
      { $match: buildDateFilter(fromDate, toDate) },
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "employeeId",
          as: "employee",
        },
      },
      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          employeeName: "$employee.name",
          employeeId: "$assignedTo",
          fromDate: 1,
          toDate: 1,
          totalDays: 1,
          status: 1,
          leaveType: 1,
          reason: 1,
        },
      },
      { $sort: { fromDate: 1 } },
    ]);

    res.status(200).json({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const singleEmployeeReport = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { fromDate, toDate } = req.query;

    const user = await User.findOne({ employeeId }).select(
      "name employeeId allotedLeaves",
    );

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const filter = {
      assignedTo: employeeId,
      ...buildDateFilter(fromDate, toDate),
    };
    const leaves = await Leave.find(filter).sort({ fromDate: 1 });

    const takenLeaves = leaves
      .filter((l) => l.status === "approved")
      .reduce((sum, l) => sum + l.totalDays, 0);

    res.status(200).json({
      message: "Success",
      data: {
        employee: {
          name: user.name,
          employeeId: user.employeeId,
          allotedLeaves: user.allotedLeaves,
          takenLeaves,
          remainingLeaves: Math.max(user.allotedLeaves - takenLeaves, 0),
        },
        leaves,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const allEmployeeReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const dateFilter =
      fromDate && toDate ? buildDateFilter(fromDate, toDate) : {};

    const users = await User.find().select("name employeeId allotedLeaves");
    const leaves = await Leave.find(dateFilter);

    const data = users.map((user) => {
      const employeeLeaves = leaves.filter(
        (l) => l.assignedTo === user.employeeId,
      );
      const takenLeaves = employeeLeaves
        .filter((l) => l.status === "approved")
        .reduce((sum, l) => sum + l.totalDays, 0);

      return {
        name: user.name,
        employeeId: user.employeeId,
        allotedLeaves: user.allotedLeaves,
        takenLeaves,
        remainingLeaves: Math.max(user.allotedLeaves - takenLeaves, 0),
        leaves: employeeLeaves,
      };
    });

    res.status(200).json({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
