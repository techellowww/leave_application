import React, { useState, useEffect } from "react";
import {
  getAllEmployeesReport,
  getDateWiseReport,
  getSingleEmployeeReport,
  getUsers,
} from "../services/api";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import { useToast } from "../components/common/Toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FileSpreadsheet, Filter, FileText } from "lucide-react";

const Reports = () => {
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState([]);
  const [reportType, setReportType] = useState("all");
  const [reportEmployeeId, setReportEmployeeId] = useState("");
  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");

  const [reportResults, setReportResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsersList();
    // Default load all employees report
    loadDefaultReport();
  }, []);

  const fetchUsersList = async () => {
    try {
      const res = await getUsers();
      setUsersList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDefaultReport = async () => {
    try {
      setLoading(true);
      const res = await getAllEmployeesReport();
      setReportResults({ type: "all", data: res.data });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setReportResults(null);

      if (reportType === "single") {
        if (!reportEmployeeId) {
          showToast("Please select an employee", "error");
          setLoading(false);
          return;
        }
        const res = await getSingleEmployeeReport(
          reportEmployeeId,
          reportFromDate,
          reportToDate,
        );
        setReportResults({ type: "single", data: res.data });
      } else if (reportType === "date") {
        if (!reportFromDate || !reportToDate) {
          showToast("Please select From Date and To Date", "error");
          setLoading(false);
          return;
        }
        const res = await getDateWiseReport(reportFromDate, reportToDate);
        setReportResults({ type: "date", data: res.data });
      } else {
        const res = await getAllEmployeesReport(reportFromDate, reportToDate);
        setReportResults({ type: "all", data: res.data });
      }
      showToast("Report generated successfully", "success");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to generate report",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!reportResults || !reportResults.data) {
      showToast("Please generate a report first", "warning");
      return;
    }

    const dateStr = new Date().toISOString().split("T")[0];
    let filename = "";
    let rows = [];

    if (reportResults.type === "all") {
      filename = `Leave_Report_All_Employees_${dateStr}.xlsx`;
      rows = (reportResults.data || []).map((emp) => ({
        "Employee Name": emp.name || "",
        "Employee ID": emp.employeeId || "",
        "Office Email": emp.email || "",
        Role: emp.role || "",
        "Allotted Leaves": emp.allotedLeaves || 0,
        "Leaves Taken": emp.takenLeaves || 0,
        "Remaining Leaves": emp.remainingLeaves || 0,
        "Total Leave Requests": emp.leaves?.length || 0,
      }));
    } else if (reportResults.type === "single") {
      const emp = reportResults.data.employee || {};
      const leaves = reportResults.data.leaves || [];
      filename = `Leave_Report_${emp.employeeId || "Employee"}_${dateStr}.xlsx`;
      rows = leaves.map((l) => ({
        "Employee Name": emp.name || "",
        "Employee ID": emp.employeeId || "",
        "From Date": l.fromDate
          ? new Date(l.fromDate).toLocaleDateString()
          : "",
        "To Date": l.toDate ? new Date(l.toDate).toLocaleDateString() : "",
        "Leave Type": l.leaveType || "",
        "Total Days": l.totalDays || 0,
        Status: l.status || "",
        Reason: l.reason || "",
      }));
    } else if (reportResults.type === "date") {
      filename = `Leave_Report_DateWise_${dateStr}.xlsx`;
      rows = (reportResults.data || []).map((l) => ({
        "Employee Name": l.employeeName || "",
        "Employee ID": l.employeeId || "",
        "From Date": l.fromDate
          ? new Date(l.fromDate).toLocaleDateString()
          : "",
        "To Date": l.toDate ? new Date(l.toDate).toLocaleDateString() : "",
        "Leave Type": l.leaveType || "",
        "Total Days": l.totalDays || 0,
        Status: l.status || "",
        Reason: l.reason || "",
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Report");
    XLSX.writeFile(workbook, filename);
    showToast("Excel report downloaded successfully!", "success");
  };

  const handleDownloadPDF = () => {
    if (!reportResults || !reportResults.data) {
      showToast("Please generate a report first", "warning");
      return;
    }

    const doc = new jsPDF();
    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    let title = "Leave Application Report";
    let filename = `Leave_Report_${new Date().toISOString().split("T")[0]}.pdf`;
    let head = [];
    let body = [];

    if (reportResults.type === "all") {
      title = "All Employees Leave Summary Report";
      filename = `Leave_Report_All_Employees_${new Date().toISOString().split("T")[0]}.pdf`;
      head = [
        [
          "Employee Name",
          "Employee ID",
          "Office Email",
          "Role",
          "Allotted",
          "Taken",
          "Remaining",
          "Total Requests",
        ],
      ];
      body = (reportResults.data || []).map((emp) => [
        emp.name || "",
        emp.employeeId || "",
        emp.email || "",
        emp.role || "",
        emp.allotedLeaves || 0,
        emp.takenLeaves || 0,
        emp.remainingLeaves || 0,
        emp.leaves?.length || 0,
      ]);
    } else if (reportResults.type === "single") {
      const emp = reportResults.data.employee || {};
      const leaves = reportResults.data.leaves || [];
      title = `Leave Report - ${emp.name || "Employee"} (${emp.employeeId || ""})`;
      filename = `Leave_Report_${emp.employeeId || "Employee"}_${new Date().toISOString().split("T")[0]}.pdf`;
      head = [
        [
          "From Date",
          "To Date",
          "Leave Type",
          "Total Days",
          "Status",
          "Reason",
        ],
      ];
      body = leaves.map((l) => [
        l.fromDate ? new Date(l.fromDate).toLocaleDateString() : "",
        l.toDate ? new Date(l.toDate).toLocaleDateString() : "",
        l.leaveType || "",
        l.totalDays || 0,
        l.status || "",
        l.reason || "",
      ]);
    } else if (reportResults.type === "date") {
      title = `Date-Wise Leave Report (${reportFromDate || "Start"} to ${reportToDate || "End"})`;
      filename = `Leave_Report_DateWise_${new Date().toISOString().split("T")[0]}.pdf`;
      head = [
        [
          "Employee Name",
          "Employee ID",
          "From Date",
          "To Date",
          "Leave Type",
          "Total Days",
          "Status",
        ],
      ];
      body = (reportResults.data || []).map((l) => [
        l.employeeName || "",
        l.employeeId || "",
        l.fromDate ? new Date(l.fromDate).toLocaleDateString() : "",
        l.toDate ? new Date(l.toDate).toLocaleDateString() : "",
        l.leaveType || "",
        l.totalDays || 0,
        l.status || "",
      ]);
    }

    // Title
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(title, 14, 18);

    // Metadata
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated Date: ${formattedDate}`, 14, 25);

    // Table
    autoTable(doc, {
      startY: 30,
      head: head,
      body: body,
      theme: "striped",
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(filename);
    showToast("PDF report downloaded successfully!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Banner */}

      {/* Filter Form Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Filter size={20} color="var(--primary-600)" /> Configure Report
            Filters
          </h3>
        </div>

        <form onSubmit={handleGenerateReport}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Report Type</label>
              <select
                className="form-control"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="all">All Employees Summary</option>
                <option value="single">Single Employee Detailed</option>
                <option value="date">Date Range Detailed</option>
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
              <label className="form-label">From Date (Optional)</label>
              <input
                type="date"
                className="form-control"
                value={reportFromDate}
                onChange={(e) => setReportFromDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To Date (Optional)</label>
              <input
                type="date"
                className="form-control"
                value={reportToDate}
                onChange={(e) => setReportToDate(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : "Run Filter Report"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Card */}
      {reportResults && (
        <div className="card">
          <div
            className="card-header"
            style={{ flexWrap: "wrap", gap: "1rem" }}
          >
            <h3 className="card-title">
              <FileSpreadsheet size={20} color="var(--primary-600)" /> Report
              Output
            </h3>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleDownloadExcel}
              >
                <FileSpreadsheet size={15} /> Download Excel
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleDownloadPDF}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  borderColor: "#dc2626",
                }}
              >
                <FileText size={15} /> Download PDF
              </button>
            </div>
          </div>

          {reportResults.type === "single" && reportResults.data?.employee && (
            <div>
              <div
                className="grid-responsive-cards"
                style={{
                  padding: "1.25rem",
                  backgroundColor: "var(--bg-slate)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1.25rem",
                }}
              >
                <div>
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    Employee Name
                  </span>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                    {reportResults.data.employee.name}
                  </div>
                </div>
                <div>
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    Employee ID
                  </span>
                  <div style={{ fontWeight: 700, fontFamily: "monospace" }}>
                    {reportResults.data.employee.employeeId}
                  </div>
                </div>
                <div>
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    Allotted Leaves
                  </span>
                  <div style={{ fontWeight: 700 }}>
                    {reportResults.data.employee.allotedLeaves} days
                  </div>
                </div>
                <div>
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    Leaves Taken
                  </span>
                  <div style={{ fontWeight: 700, color: "#4f46e5" }}>
                    {reportResults.data.employee.takenLeaves} days
                  </div>
                </div>
                <div>
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    Remaining Leaves
                  </span>
                  <div style={{ fontWeight: 700, color: "#10b981" }}>
                    {reportResults.data.employee.remainingLeaves} days
                  </div>
                </div>
              </div>

              <DataTable
                columns={[
                  {
                    header: "From Date",
                    render: (r) => new Date(r.fromDate).toLocaleDateString(),
                  },
                  {
                    header: "To Date",
                    render: (r) => new Date(r.toDate).toLocaleDateString(),
                  },
                  { header: "Type", accessor: "leaveType" },
                  { header: "Total Days", accessor: "totalDays" },
                  {
                    header: "Status",
                    render: (r) => <StatusBadge status={r.status} />,
                  },
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
                {
                  header: "From Date",
                  render: (r) => new Date(r.fromDate).toLocaleDateString(),
                },
                {
                  header: "To Date",
                  render: (r) => new Date(r.toDate).toLocaleDateString(),
                },
                { header: "Leave Type", accessor: "leaveType" },
                { header: "Total Days", accessor: "totalDays" },
                {
                  header: "Status",
                  render: (r) => <StatusBadge status={r.status} />,
                },
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
                { header: "Allotted Leaves", accessor: "allotedLeaves" },
                { header: "Taken Leaves", accessor: "takenLeaves" },
                { header: "Remaining Leaves", accessor: "remainingLeaves" },
                {
                  header: "Total Requests",
                  render: (r) => r.leaves?.length || 0,
                },
              ]}
              data={reportResults.data}
              loading={false}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
