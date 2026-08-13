import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getLeaves,
  createLeave,
  updateLeave,
  deleteLeave,
  getUsers,
} from "../services/api";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useToast } from "../components/common/Toast";
import {
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  AlertCircle,
  Trash2,
  Clock,
  Filter,
  Edit2,
} from "lucide-react";

const LeaveModule = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // Apply / Edit Leave Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
    totalDays: 0,
    leaveType: "Casual",
    assignedTo: "",
  });
  const [dateError, setDateError] = useState("");

  // View Details Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingLeave, setViewingLeave] = useState(null);

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectedReasonText, setRejectedReasonText] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // View Reason Modal State
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [viewReasonContent, setViewReasonContent] = useState("");

  // Delete Confirm Dialog State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLeavesList();
    fetchUsersData();
  }, []);

  const fetchLeavesList = async () => {
    try {
      setLoading(true);
      const res = await getLeaves();
      setLeaves(res.data || []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      showToast("Failed to load leave applications", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersData = async () => {
    try {
      const res = await getUsers();
      setUsersList(res.data || []);
      // Set default assignedTo to admin user or first employee in list
      const adminUser =
        res.data?.find((u) => u.role === "admin") || res.data?.[0];
      if (adminUser) {
        setFormData((prev) => ({ ...prev, assignedTo: adminUser.employeeId }));
      }
    } catch (err) {
      console.error("Error fetching users data:", err);
    }
  };

  // Calculate Total Days automatically whenever dates change
  const handleDateChange = (field, value) => {
    const newForm = { ...formData, [field]: value };

    if (newForm.fromDate && newForm.toDate) {
      const start = new Date(newForm.fromDate);
      const end = new Date(newForm.toDate);

      if (end < start) {
        setDateError("'To Date' cannot be earlier than 'From Date'");
        newForm.totalDays = 0;
      } else {
        setDateError("");
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        newForm.totalDays = diffDays;
      }
    } else {
      setDateError("");
      newForm.totalDays = 0;
    }

    setFormData(newForm);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (dateError) {
      showToast("Please fix date range errors", "error");
      return;
    }

    if (
      !formData.fromDate ||
      !formData.toDate ||
      !formData.reason ||
      !formData.assignedTo
    ) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        employeeId: user?.employeeId,
        assignedTo: formData.assignedTo || user?.employeeId,
      };

      if (editingLeaveId) {
        await updateLeave(editingLeaveId, payload);
        showToast("Leave request updated successfully!", "success");
      } else {
        payload.status = "pending";
        await createLeave(payload);
        showToast("Leave request submitted successfully!", "success");
      }

      setIsApplyModalOpen(false);
      resetApplyForm();
      fetchLeavesList();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to save leave request",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetApplyForm = () => {
    setEditingLeaveId(null);
    setFormData({
      fromDate: "",
      toDate: "",
      reason: "",
      totalDays: 0,
      leaveType: "Casual",
      assignedTo: usersList[0]?.employeeId || user?.employeeId || "",
    });
    setDateError("");
  };

  const openEditModal = (item) => {
    if (item.status !== "pending" && !isAdmin) {
      showToast("Only pending leave requests can be edited", "error");
      return;
    }
    setEditingLeaveId(item._id);
    setFormData({
      fromDate: item.fromDate ? new Date(item.fromDate).toISOString().split("T")[0] : "",
      toDate: item.toDate ? new Date(item.toDate).toISOString().split("T")[0] : "",
      reason: item.reason || "",
      totalDays: item.totalDays || 0,
      leaveType: item.leaveType || "Casual",
      assignedTo: item.assignedTo || "",
    });
    setDateError("");
    setIsApplyModalOpen(true);
  };

  const openViewModal = (item) => {
    setViewingLeave(item);
    setIsViewModalOpen(true);
  };

  const handleApprove = async (id) => {
    try {
      await updateLeave(id, { status: "approved" });
      showToast("Leave approved successfully", "success");
      fetchLeavesList();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to approve leave",
        "error",
      );
    }
  };

  const openRejectModal = (id) => {
    setSelectedLeaveId(id);
    setRejectedReasonText("");
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!rejectedReasonText.trim()) {
      showToast("Please enter a reason for rejection", "error");
      return;
    }

    try {
      setRejecting(true);
      await updateLeave(selectedLeaveId, {
        status: "rejected",
        rejectedReason: rejectedReasonText,
      });
      showToast("Leave rejected", "info");
      setIsRejectModalOpen(false);
      fetchLeavesList();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to reject leave",
        "error",
      );
    } finally {
      setRejecting(false);
    }
  };

  const openReasonModal = (reason) => {
    setViewReasonContent(reason);
    setIsReasonModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await deleteLeave(deleteTargetId);
      showToast("Leave deleted successfully", "success");
      setIsDeleteModalOpen(false);
      fetchLeavesList();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to delete leave",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const filteredLeaves = leaves.filter((item) => {
    const isOwnData =
      isAdmin ||
      item.employeeId === user?.employeeId ||
      item.assignedTo === user?.employeeId;
    if (!isOwnData) return false;
    if (statusFilter === "all") return true;
    return item.status === statusFilter;
  });

  const columns = [
    {
      header: "Dates Range",
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
            {new Date(r.fromDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            -{" "}
            {new Date(r.toDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {r.totalDays} {r.totalDays === 1 ? "day" : "days"} duration
          </div>
        </div>
      ),
    },
    {
      header: "Leave Type",
      render: (r) => <StatusBadge status={r.leaveType} />,
    },
    {
      header: "Assigned Employee",
      render: (r) => {
        const assignedUser = usersList.find((u) => u.employeeId === r.assignedTo);
        return (
          <div>
            <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
              {assignedUser ? assignedUser.name : r.assignedTo}
            </div>
            {assignedUser && (
              <span
                className="badge badge-neutral"
                style={{ fontSize: "0.6875rem", fontFamily: "monospace", marginTop: "2px" }}
              >
                {r.assignedTo}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Reason",
      accessor: "reason",
      render: (r) => (
        <div
          style={{
            maxWidth: "240px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {r.reason}
        </div>
      ),
    },
    {
      header: "Status",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <StatusBadge status={r.status} />
          {r.status === "rejected" && r.rejectedReason && (
            <button
              onClick={() => openReasonModal(r.rejectedReason)}
              className="btn-icon btn-secondary btn-sm"
              title="View Rejection Reason"
              style={{ padding: "2px 6px" }}
            >
              <Eye size={13} color="#ef4444" />
            </button>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isAdmin && r.status === "pending" && (
            <>
              <button
                onClick={() => handleApprove(r._id)}
                className="btn btn-success btn-sm"
                title="Approve Leave"
              >
                <CheckCircle size={14} /> Approve
              </button>
              <button
                onClick={() => openRejectModal(r._id)}
                className="btn btn-danger btn-sm"
                title="Reject Leave"
              >
                <XCircle size={14} /> Reject
              </button>
            </>
          )}

          {/* View Details Button (Always available for viewing) */}
          <button
            onClick={() => openViewModal(r)}
            className="btn-icon btn-secondary btn-sm"
            title="View Details"
          >
            <Eye size={15} color="var(--primary-600)" />
          </button>

          {/* Edit Button (ONLY available if status === 'pending') */}
          {r.status === "pending" && (
            <button
              onClick={() => openEditModal(r)}
              className="btn-icon btn-secondary btn-sm"
              style={{ color: "#4f46e5" }}
              title="Edit Pending Application"
            >
              <Edit2 size={15} />
            </button>
          )}

          {/* Delete Button (Available for pending or Admin) */}
          {(r.status === "pending" || isAdmin) && (
            <button
              onClick={() => {
                setDeleteTargetId(r._id);
                setIsDeleteModalOpen(true);
              }}
              className="btn-icon btn-secondary btn-sm"
              style={{ color: "#ef4444", border: "none" }}
              title="Delete Leave Request"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.375rem",
              margin: "0 0 0.25rem",
              color: "var(--text-main)",
            }}
          >
            Leave Management
          </h2>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            resetApplyForm();
            setIsApplyModalOpen(true);
          }}
        >
          <Plus size={18} /> Apply for Leave
        </button>
      </div>

      {/* Leave Status Filters & Data Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <h3 className="card-title">
            <Calendar size={20} color="var(--primary-600)" /> Leave Applications
            History
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <Filter size={16} color="var(--text-muted)" />
            {["all", "pending", "approved", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? "btn-primary" : "btn-secondary"}`}
                style={{ textTransform: "capitalize" }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredLeaves}
          loading={loading}
          searchKey="reason"
          placeholder="Search by reason..."
        />
      </div>

      {/* Apply / Edit Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          resetApplyForm();
        }}
        title={editingLeaveId ? "Edit Pending Leave Application" : "Apply for Leave"}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setIsApplyModalOpen(false);
                resetApplyForm();
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleApplySubmit}
              disabled={submitting || !!dateError}
            >
              {submitting ? (
                <span className="spinner" />
              ) : editingLeaveId ? (
                "Update Application"
              ) : (
                "Submit Application"
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleApplySubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                From Date <span className="required-star">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={formData.fromDate}
                onChange={(e) => handleDateChange("fromDate", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                To Date <span className="required-star">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={formData.toDate}
                onChange={(e) => handleDateChange("toDate", e.target.value)}
                required
              />
            </div>
          </div>

          {dateError && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "0.8125rem",
                marginTop: "-0.5rem",
                marginBottom: "1rem",
              }}
            >
              ⚠️ {dateError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Total Days (Auto-Calculated)</label>
            <input
              type="text"
              className="form-control"
              value={`${formData.totalDays} ${formData.totalDays === 1 ? "Day" : "Days"}`}
              readOnly
              style={{
                backgroundColor: "#f8fafc",
                fontWeight: 700,
                color: "var(--primary-600)",
              }}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select
                className="form-control"
                value={formData.leaveType}
                onChange={(e) =>
                  setFormData({ ...formData, leaveType: e.target.value })
                }
              >
                <option value="Casual">Casual Leave</option>
                <option value="Sick">Sick Leave</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Assigned To <span className="required-star">*</span>
              </label>
              <select
                className="form-control"
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                required
              >
                {usersList.map((emp) => (
                  <option key={emp._id} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Reason for Leave <span className="required-star">*</span>
            </label>
            <textarea
              className="form-control"
              placeholder="State the reason for your leave request..."
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              required
            />
          </div>
        </form>
      </Modal>

      {/* Reject Leave Modal (With Rejection Reason prompt) */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Leave Request"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={rejecting}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleRejectConfirm}
              disabled={rejecting}
            >
              {rejecting ? <span className="spinner" /> : "Confirm Rejection"}
            </button>
          </>
        }
      >
        <form onSubmit={handleRejectConfirm}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Rejection Reason <span className="required-star">*</span>
            </label>
            <textarea
              className="form-control"
              placeholder="Enter the reason why this leave request is being rejected..."
              value={rejectedReasonText}
              onChange={(e) => setRejectedReasonText(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>

      {/* View Rejection Reason Modal */}
      <Modal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        title="Rejection Reason"
        footer={
          <button
            className="btn btn-secondary"
            onClick={() => setIsReasonModalOpen(false)}
          >
            Close
          </button>
        }
      >
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "flex-start",
            padding: "0.5rem",
          }}
        >
          <AlertCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: "0 0 0.5rem", color: "#b91c1c" }}>
              Reason Provided by Manager:
            </h4>
            <p
              style={{ margin: 0, color: "var(--text-main)", lineHeight: 1.6 }}
            >
              {viewReasonContent}
            </p>
          </div>
        </div>
      </Modal>

      {/* View Leave Application Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingLeave(null);
        }}
        title="Leave Application Details"
        footer={
          <button
            className="btn btn-secondary"
            onClick={() => {
              setIsViewModalOpen(false);
              setViewingLeave(null);
            }}
          >
            Close
          </button>
        }
      >
        {viewingLeave && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                backgroundColor: "var(--bg-slate)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Application Status
                </span>
                <StatusBadge status={viewingLeave.status} />
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                  Total Duration
                </span>
                <span style={{ fontWeight: 700, color: "var(--primary-600)", fontSize: "1rem" }}>
                  {viewingLeave.totalDays} {viewingLeave.totalDays === 1 ? "day" : "days"}
                </span>
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                  From Date
                </span>
                <span style={{ fontWeight: 600 }}>
                  {new Date(viewingLeave.fromDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                  To Date
                </span>
                <span style={{ fontWeight: 600 }}>
                  {new Date(viewingLeave.toDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Leave Type
                </span>
                <StatusBadge status={viewingLeave.leaveType} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Assigned Employee
                </span>
                <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                  {usersList.find((u) => u.employeeId === viewingLeave.assignedTo)?.name || viewingLeave.assignedTo}
                </div>
                <span className="badge badge-neutral" style={{ fontFamily: "monospace", fontSize: "0.6875rem", marginTop: "2px" }}>
                  {viewingLeave.assignedTo}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.375rem" }}>
                Reason for Leave
              </span>
              <div
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "#f8fafc",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                }}
              >
                {viewingLeave.reason}
              </div>
            </div>

            {viewingLeave.status === "rejected" && viewingLeave.rejectedReason && (
              <div
                style={{
                  padding: "0.875rem 1rem",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#b91c1c", display: "block" }}>
                    Rejection Reason from Manager
                  </span>
                  <span style={{ fontSize: "0.84375rem", color: "#7f1d1d" }}>
                    {viewingLeave.rejectedReason}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        message="Are you sure you want to delete this leave request permanently?"
      />
    </div>
  );
};

export default LeaveModule;
