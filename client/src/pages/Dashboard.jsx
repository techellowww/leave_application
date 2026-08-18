import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getLeaveSummary,
  getMonthlySummary,
  getHolidays,
  createHoliday,
  deleteHoliday,
  getAllEmployeesReport,
  getDateWiseReport,
  getSingleEmployeeReport,
  getUsers,
} from "../services/api";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useToast } from "../components/common/Toast";
import {
  Users,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  Filter,
  Download,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  // Employee Leave Summary State
  const [leaveSummaryData, setLeaveSummaryData] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Monthly Summary Graph State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // Holidays Calendar State
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [holidayPage, setHolidayPage] = useState(1);
  const holidayPageSize = 10;
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ date: "", name: "", type: "holiday" });
  const [submittingHoliday, setSubmittingHoliday] = useState(false);
  const [deleteHolidayId, setDeleteHolidayId] = useState(null);
  const [deletingHoliday, setDeletingHoliday] = useState(false);

  // Quick Report Section State
  const getFirstDayOfMonthStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  };

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [usersList, setUsersList] = useState([]);
  const [reportType, setReportType] = useState("all"); // 'all', 'single', 'date'
  const [reportEmployeeId, setReportEmployeeId] = useState("");
  const [reportFromDate, setReportFromDate] = useState(getFirstDayOfMonthStr());
  const [reportToDate, setReportToDate] = useState(getTodayStr());
  const [reportResults, setReportResults] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchLeaveSummary();
    fetchHolidaysList();
    if (isAdmin) {
      fetchUsersList();
    }
  }, [isAdmin]);

  // Fetch monthly graph data when month or year changes
  useEffect(() => {
    fetchMonthlySummaryData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const fetchLeaveSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await getLeaveSummary();
      setLeaveSummaryData(res.data || []);
    } catch (err) {
      console.error("Error fetching leave summary:", err);
      showToast("Failed to load employee leave summary", "error");
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchMonthlySummaryData = async (m, y) => {
    try {
      setLoadingMonthly(true);
      const res = await getMonthlySummary(m, y);
      setMonthlyData(res.data);
    } catch (err) {
      console.error("Error fetching monthly graph data:", err);
    } finally {
      setLoadingMonthly(false);
    }
  };

  const fetchHolidaysList = async () => {
    try {
      setLoadingHolidays(true);
      const res = await getHolidays();
      setHolidays(res.data || []);
    } catch (err) {
      console.error("Error fetching holidays:", err);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      const res = await getUsers();
      setUsersList(res.data || []);
    } catch (err) {
      console.error("Error fetching users list:", err);
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!holidayForm.date || !holidayForm.name) {
      showToast("Please provide date and holiday name", "error");
      return;
    }

    try {
      setSubmittingHoliday(true);
      await createHoliday(holidayForm);
      showToast("Holiday added successfully", "success");
      setIsHolidayModalOpen(false);
      setHolidayForm({ date: "", name: "", type: "holiday" });
      fetchHolidaysList();
      fetchMonthlySummaryData(selectedMonth, selectedYear);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add holiday", "error");
    } finally {
      setSubmittingHoliday(false);
    }
  };

  const handleDeleteHoliday = (id) => {
    setDeleteHolidayId(id);
  };

  const handleConfirmDeleteHoliday = async () => {
    if (!deleteHolidayId) return;
    try {
      setDeletingHoliday(true);
      await deleteHoliday(deleteHolidayId);
      showToast("Holiday deleted successfully", "success");
      setDeleteHolidayId(null);
      fetchHolidaysList();
      fetchMonthlySummaryData(selectedMonth, selectedYear);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete holiday", "error");
    } finally {
      setDeletingHoliday(false);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!reportFromDate || !reportToDate) {
      showToast("Please select From Date and To Date", "error");
      return;
    }

    if (reportToDate < reportFromDate) {
      showToast("To Date cannot be earlier than From Date", "error");
      return;
    }

    try {
      setLoadingReport(true);
      setReportResults(null);

      if (reportType === "single") {
        if (!reportEmployeeId) {
          showToast("Please select an employee", "error");
          setLoadingReport(false);
          return;
        }
        const res = await getSingleEmployeeReport(reportEmployeeId, reportFromDate, reportToDate);
        setReportResults({ type: "single", data: res.data, fromDate: reportFromDate, toDate: reportToDate });
      } else if (reportType === "date") {
        const res = await getDateWiseReport(reportFromDate, reportToDate);
        setReportResults({ type: "date", data: res.data, fromDate: reportFromDate, toDate: reportToDate });
      } else {
        const res = await getAllEmployeesReport(reportFromDate, reportToDate);
        setReportResults({ type: "all", data: res.data, fromDate: reportFromDate, toDate: reportToDate });
      }
      showToast("Report generated successfully", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to generate report", "error");
    } finally {
      setLoadingReport(false);
    }
  };

  const exportToCSV = (filename, rows, headerLines = []) => {
    if (!rows || !rows.length) {
      showToast("No data available to download", "warning");
      return;
    }
    const separator = ",";
    const keys = Object.keys(rows[0]);
    let csvContent = "";
    if (headerLines && headerLines.length) {
      csvContent += headerLines.join("\n") + "\n\n";
    }
    csvContent +=
      keys.join(separator) +
      "\n" +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? "" : row[k];
              cell = cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator)
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Report downloaded successfully!", "success");
  };

  const handleDownloadReportCSV = () => {
    if (!reportResults || !reportResults.data) {
      showToast("Please generate a report first", "warning");
      return;
    }

    const fromDate = reportResults.fromDate || reportFromDate;
    const toDate = reportResults.toDate || reportToDate;

    if (!fromDate || !toDate) {
      showToast("From Date and To Date are required to export report", "error");
      return;
    }

    const headerLines = [
      `Date Range: ${fromDate} to ${toDate}`,
      `Generated On: ${new Date().toLocaleDateString()}`
    ];

    if (reportResults.type === "all") {
      const rows = (reportResults.data || []).map((emp) => ({
        "Employee Name": emp.name || "",
        "Employee ID": emp.employeeId || "",
        "Office Email": emp.email || "",
        "Role": emp.role || "",
        "Allotted Leaves": emp.allotedLeaves || 0,
        "Leaves Taken": emp.takenLeaves || 0,
        "Remaining Leaves": emp.remainingLeaves || 0,
        "Total Leave Requests": emp.leaves?.length || 0,
      }));
      exportToCSV(`Leave_Report_All_Employees_${fromDate}_to_${toDate}.csv`, rows, headerLines);
    } else if (reportResults.type === "single") {
      const emp = reportResults.data.employee || {};
      const leaves = reportResults.data.leaves || [];
      const rows = leaves.map((l) => ({
        "Employee Name": emp.name || "",
        "Employee ID": emp.employeeId || "",
        "From Date": l.fromDate ? new Date(l.fromDate).toLocaleDateString() : "",
        "To Date": l.toDate ? new Date(l.toDate).toLocaleDateString() : "",
        "Leave Type": l.leaveType || "",
        "Total Days": l.totalDays || 0,
        "Status": l.status || "",
        "Reason": l.reason || "",
      }));
      exportToCSV(`Leave_Report_${emp.employeeId || "Employee"}_${fromDate}_to_${toDate}.csv`, rows, headerLines);
    } else if (reportResults.type === "date") {
      const rows = (reportResults.data || []).map((l) => ({
        "Employee Name": l.employeeName || "",
        "Employee ID": l.employeeId || "",
        "From Date": l.fromDate ? new Date(l.fromDate).toLocaleDateString() : "",
        "To Date": l.toDate ? new Date(l.toDate).toLocaleDateString() : "",
        "Leave Type": l.leaveType || "",
        "Total Days": l.totalDays || 0,
        "Status": l.status || "",
      }));
      exportToCSV(`Leave_Report_DateWise_${fromDate}_to_${toDate}.csv`, rows, headerLines);
    }
  };

  // Prepare chart data for Recharts
  const chartData = monthlyData
    ? [
        { name: "Working Days", days: monthlyData.totalWorkingDays, fill: "#4f46e5" },
        { name: "Sundays", days: monthlyData.sundays, fill: "#f59e0b" },
        { name: "Holidays", days: monthlyData.holidays, fill: "#ec4899" },
      ]
    : [];

  const summaryColumns = [
    {
      header: "Employee Name",
      accessor: "name",
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{row.name}</span>
        </div>
      ),
    },
    {
      header: "Employee ID",
      accessor: "employeeId",
      render: (row) => (
        <span className="badge badge-neutral" style={{ fontFamily: "monospace" }}>
          {row.employeeId}
        </span>
      ),
    },
    {
      header: "Allotted Leaves",
      accessor: "allotedLeaves",
      render: (row) => <span style={{ fontWeight: 600 }}>{row.allotedLeaves} days</span>,
    },
    {
      header: "Leaves Taken",
      accessor: "takenLeaves",
      render: (row) => (
        <span style={{ fontWeight: 700, color: row.takenLeaves > 0 ? "#4f46e5" : "#64748b" }}>
          {row.takenLeaves} days
        </span>
      ),
    },
    {
      header: "Remaining Leaves",
      accessor: "remainingLeaves",
      render: (row) => (
        <span
          className={`badge ${
            row.remainingLeaves <= 3
              ? "badge-danger"
              : row.remainingLeaves <= 7
              ? "badge-warning"
              : "badge-success"
          }`}
          style={{ fontSize: "0.8125rem", padding: "0.35rem 0.75rem" }}
        >
          {row.remainingLeaves} days
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Welcome & Summary Metric Cards */}
      <div className="grid-responsive-cards">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{isAdmin ? (leaveSummaryData?.length || 0) : 1}</div>
            <div className="stat-label">{isAdmin ? "Total Employees" : "My Account"}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#ecfdf5", color: "#10b981" }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">
              {monthlyData ? monthlyData.totalWorkingDays : 0}
            </div>
            <div className="stat-label">Working Days ({selectedMonth}/{selectedYear})</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#fef2f2", color: "#ec4899" }}>
            <CalendarIcon size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{holidays?.length || 0}</div>
            <div className="stat-label">Listed Company Holidays</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#fffbeb", color: "#f59e0b" }}>
            <Building size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{user?.role?.toUpperCase()}</div>
            <div className="stat-label">Access Permissions</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Employee Leave Summary Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Users size={20} color="var(--primary-600)" /> {isAdmin ? "Employee Leave Summary" : "My Leave Summary"}
            </h3>
          </div>
        </div>

        <DataTable
          columns={summaryColumns}
          data={isAdmin ? leaveSummaryData : leaveSummaryData.filter((item) => item.employeeId === user?.employeeId)}
          loading={loadingSummary}
          searchKey="name"
          placeholder="Search employee by name..."
        />
      </div>

      {/* SECTION 2 & 3: Calendar / Holidays & Monthly Graph (2 Column Layout) */}
      <div className="grid-responsive-dashboard">
        
        {/* Monthly Summary Graph (Pie Chart) */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
            <h3 className="card-title">
              <PieChartIcon size={20} color="var(--primary-600)" /> Monthly Summary Chart
            </h3>

            {/* Month & Year Selectors */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <select
                className="form-control"
                style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem", width: "auto" }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                className="form-control"
                style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem", width: "auto" }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingMonthly ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <span className="spinner spinner-dark" />
            </div>
          ) : monthlyData ? (
            <div>
              <div style={{ height: "260px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="days"
                      label={({ name, days }) => `${days}d`}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} Days`, name]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontSize: "0.8125rem",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={32} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div
                className="form-grid-3"
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border-color)",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#4f46e5" }}>
                    {monthlyData.totalWorkingDays}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Working Days</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f59e0b" }}>
                    {monthlyData.sundays}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sundays</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ec4899" }}>
                    {monthlyData.holidays}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Holidays</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Calendar & Company Holidays */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CalendarIcon size={20} color="var(--primary-600)" /> Company Holidays
            </h3>
            {isAdmin && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsHolidayModalOpen(true)}
              >
                <Plus size={16} /> Add Holiday
              </button>
            )}
          </div>

          <div>
            {loadingHolidays ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <span className="spinner spinner-dark" />
              </div>
            ) : holidays.length > 0 ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {holidays
                    .slice(
                      (holidayPage - 1) * holidayPageSize,
                      holidayPage * holidayPageSize
                    )
                    .map((item) => (
                      <div
                        key={item._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.75rem 1rem",
                          backgroundColor: "var(--bg-slate)",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                          <div
                            style={{
                              padding: "0.375rem 0.625rem",
                              borderRadius: "6px",
                              backgroundColor: "#eef2ff",
                              color: "#4f46e5",
                              fontWeight: 700,
                              fontSize: "0.8125rem",
                              textAlign: "center",
                            }}
                          >
                            {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{item.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {new Date(item.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric" })} • {item.type}
                            </div>
                          </div>
                        </div>

                        {isAdmin && (
                          <button
                            className="btn-icon"
                            style={{ backgroundColor: "transparent", color: "#ef4444", border: "none" }}
                            onClick={() => handleDeleteHoliday(item._id)}
                            title="Delete Holiday"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                </div>

                {holidays.length > holidayPageSize && (
                  <div className="pagination-wrapper" style={{ marginTop: "1rem" }}>
                    <div className="pagination-info">
                      Showing <span>{(holidayPage - 1) * holidayPageSize + 1}</span> to{" "}
                      <span>{Math.min(holidayPage * holidayPageSize, holidays.length)}</span> of{" "}
                      <span>{holidays.length}</span> entries
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="pagination-btn"
                        onClick={() => setHolidayPage((prev) => Math.max(prev - 1, 1))}
                        disabled={holidayPage === 1}
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={16} />
                        <span>Previous</span>
                      </button>
                      <div className="pagination-pages">
                        {Array.from(
                          { length: Math.ceil(holidays.length / holidayPageSize) },
                          (_, i) => i + 1
                        ).map((p) => (
                          <button
                            key={p}
                            className={`pagination-page-num ${p === holidayPage ? "active" : ""}`}
                            onClick={() => setHolidayPage(p)}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <button
                        className="pagination-btn"
                        onClick={() =>
                          setHolidayPage((prev) =>
                            Math.min(prev + 1, Math.ceil(holidays.length / holidayPageSize))
                          )
                        }
                        disabled={holidayPage >= Math.ceil(holidays.length / holidayPageSize)}
                        aria-label="Next page"
                      >
                        <span>Next</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state" style={{ padding: "2rem" }}>
                <p>No holidays added yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SECTION 4: Report Generation Section (Admin Only) */}
      {isAdmin && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <FileSpreadsheet size={20} color="var(--primary-600)" /> Leave Report Generation
              </h3>
            </div>
          </div>

          {/* Filter Controls Form */}
          <form onSubmit={handleGenerateReport} style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Report Scope</label>
                <select
                  className="form-control"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="all">All Employees</option>
                  <option value="single">Single Employee</option>
                  <option value="date">Date Range Only</option>
                </select>
              </div>

              {reportType === "single" && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Select Employee <span className="required-star">*</span>
                  </label>
                  <select
                    className="form-control"
                    value={reportEmployeeId}
                    onChange={(e) => setReportEmployeeId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {usersList.map((emp) => (
                      <option key={emp._id} value={emp.employeeId}>
                        {emp.name} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  From Date <span className="required-star">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={reportFromDate}
                  onChange={(e) => setReportFromDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  To Date <span className="required-star">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={reportToDate}
                  onChange={(e) => setReportToDate(e.target.value)}
                  min={reportFromDate || undefined}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  disabled={loadingReport}
                >
                  {loadingReport ? (
                    <span className="spinner" />
                  ) : (
                    <>
                      <Filter size={16} /> Generate Report
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>

          {/* Report Output Results */}
          {reportResults && (
            <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Report Summary</h4>
                <button className="btn btn-primary btn-sm" onClick={handleDownloadReportCSV}>
                  <Download size={15} /> Download CSV File
                </button>
              </div>

              {reportResults.type === "single" && reportResults.data?.employee && (
                <div>
                  <div style={{ padding: "1rem", backgroundColor: "var(--bg-slate)", borderRadius: "var(--radius-md)", marginBottom: "1rem", display: "flex", gap: "2rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Employee</span>
                      <div style={{ fontWeight: 700 }}>{reportResults.data.employee.name} ({reportResults.data.employee.employeeId})</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Allotted / Taken / Remaining</span>
                      <div style={{ fontWeight: 700, color: "#4f46e5" }}>
                        {reportResults.data.employee.allotedLeaves} / {reportResults.data.employee.takenLeaves} / {reportResults.data.employee.remainingLeaves} days
                      </div>
                    </div>
                  </div>

                  <DataTable
                    columns={[
                      { header: "From Date", render: (r) => new Date(r.fromDate).toLocaleDateString() },
                      { header: "To Date", render: (r) => new Date(r.toDate).toLocaleDateString() },
                      { header: "Type", accessor: "leaveType" },
                      { header: "Total Days", accessor: "totalDays" },
                      { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
                      { header: "Reason", accessor: "reason" },
                    ]}
                    data={reportResults.data.leaves}
                    loading={false}
                  />
                </div>
              )}

              {reportResults.type === "date" && (
                <DataTable
                  columns={[
                    { header: "Employee Name", accessor: "employeeName" },
                    { header: "Employee ID", accessor: "employeeId" },
                    { header: "From Date", render: (r) => new Date(r.fromDate).toLocaleDateString() },
                    { header: "To Date", render: (r) => new Date(r.toDate).toLocaleDateString() },
                    { header: "Leave Type", accessor: "leaveType" },
                    { header: "Days", accessor: "totalDays" },
                    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
                  ]}
                  data={reportResults.data}
                  loading={false}
                />
              )}

              {reportResults.type === "all" && (
                <DataTable
                  columns={[
                    { header: "Employee Name", accessor: "name" },
                    { header: "Employee ID", accessor: "employeeId" },
                    { header: "Allotted", accessor: "allotedLeaves" },
                    { header: "Taken Leaves", accessor: "takenLeaves" },
                    { header: "Remaining Leaves", accessor: "remainingLeaves" },
                    { header: "Total Requests", render: (r) => r.leaves?.length || 0 },
                  ]}
                  data={reportResults.data}
                  loading={false}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal for Adding Company Holiday */}
      <Modal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        title="Add Company Holiday"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsHolidayModalOpen(false)} disabled={submittingHoliday}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddHoliday} disabled={submittingHoliday}>
              {submittingHoliday ? <span className="spinner" /> : "Save Holiday"}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddHoliday}>
          <div className="form-group">
            <label className="form-label">
              Holiday Name <span className="required-star">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Independence Day"
              value={holidayForm.name}
              onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Date <span className="required-star">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={holidayForm.date}
              onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category / Type</label>
            <select
              className="form-control"
              value={holidayForm.type}
              onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
            >
              <option value="holiday">Company Holiday</option>
              <option value="non-working">Non-Working Day</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Holiday Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteHolidayId}
        onClose={() => setDeleteHolidayId(null)}
        onConfirm={handleConfirmDeleteHoliday}
        title="Delete Holiday"
        message="Are you sure you want to delete this holiday? This action cannot be undone."
        loading={deletingHoliday}
      />
    </div>
  );
};

export default Dashboard;
