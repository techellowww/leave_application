import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/api";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useToast } from "../components/common/Toast";
import {
  UserPlus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Users,
  Phone,
  Mail,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

const UsersModule = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    role: "user",
    employeeId: "",
    joiningDate: "",
    allotedLeaves: 2,
    status: "active",
  });

  // Delete Confirm Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [modalError, setModalError] = useState("");

  useEffect(() => {
    fetchUsersList();
  }, []);

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast("Failed to load employee list", "error");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowPassword(false);
  };

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setModalError("");
    setShowPassword(false);
    setForm({
      name: "",
      email: "",
      password: "",
      mobileNumber: "",
      role: "user",
      employeeId: `EMP${Math.floor(100 + Math.random() * 900)}`,
      joiningDate: new Date().toISOString().split("T")[0],
      allotedLeaves: 2,
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (userItem) => {
    setEditingUserId(userItem._id);
    setModalError("");
    setShowPassword(false);
    setForm({
      name: userItem.name || "",
      email: userItem.email || "",
      password: userItem.password || "",
      mobileNumber: userItem.mobileNumber || "",
      role: userItem.role || "user",
      employeeId: userItem.employeeId || "",
      joiningDate: userItem.joiningDate ? new Date(userItem.joiningDate).toISOString().split("T")[0] : "",
      allotedLeaves: userItem.allotedLeaves ?? 2,
      status: userItem.status || "active",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    const trimName = form.name ? form.name.trim() : "";
    const trimEmail = form.email ? form.email.trim() : "";
    const trimMobile = form.mobileNumber ? form.mobileNumber.trim() : "";
    const trimEmpId = form.employeeId ? form.employeeId.trim() : "";

    if (!trimName || !trimEmail || !trimMobile || !trimEmpId || !form.joiningDate) {
      const msg = "Please fill in all required fields";
      setModalError(msg);
      showToast(msg, "error");
      return;
    }

    // 1. Email ID Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimEmail)) {
      const msg = "Please enter a valid email address (e.g. user@company.com)";
      setModalError(msg);
      showToast(msg, "error");
      return;
    }

    // 2. Indian Mobile Number Validation
    // Accepts 10-digit number starting with 6-9, optionally prefixed with +91 or 0
    const indianMobileRegex = /^(?:\+91[\-\s]?|0)?[6-9]\d{9}$/;
    if (!indianMobileRegex.test(trimMobile)) {
      const msg = "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +919876543210)";
      setModalError(msg);
      showToast(msg, "error");
      return;
    }

    const payload = {
      ...form,
      name: trimName,
      email: trimEmail,
      mobileNumber: trimMobile,
      employeeId: trimEmpId,
    };

    try {
      setSubmitting(true);
      if (editingUserId) {
        // Edit existing user
        await updateUser(editingUserId, payload);
        showToast("Employee details updated successfully", "success");
      } else {
        // Add new user
        if (!form.password) {
          const msg = "Password is required for new employees";
          setModalError(msg);
          showToast(msg, "error");
          setSubmitting(false);
          return;
        }
        await createUser(payload);
        showToast("New employee added successfully", "success");
      }
      closeModal();
      fetchUsersList();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Operation failed";
      setModalError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userItem) => {
    const newStatus = userItem.status === "active" ? "inactive" : "active";
    try {
      await updateUser(userItem._id, { status: newStatus });
      showToast(`User status updated to ${newStatus}`, "success");
      fetchUsersList();
    } catch (err) {
      showToast("Failed to change user status", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await deleteUser(deleteTargetId);
      showToast("User deleted successfully", "success");
      setIsDeleteOpen(false);
      fetchUsersList();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete user", "error");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: "Employee Details",
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{r.name}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ID: {r.employeeId}</div>
        </div>
      ),
    },
    {
      header: "Office Email",
      accessor: "email",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem" }}>
          <Mail size={14} color="#64748b" />
          {r.email}
        </div>
      ),
    },
    {
      header: "Mobile Number",
      accessor: "mobileNumber",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem" }}>
          <Phone size={14} color="#64748b" />
          {r.mobileNumber}
        </div>
      ),
    },
    {
      header: "Password",
      accessor: "password",
      render: (r) => (
        <div style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "var(--text-main)" }}>
          {r.password || "N/A"}
        </div>
      ),
    },
    {
      header: "Role",
      render: (r) => <StatusBadge status={r.role} />,
    },
    {
      header: "Joining Date",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem" }}>
          <Calendar size={14} color="#64748b" />
          {r.joiningDate ? new Date(r.joiningDate).toLocaleDateString() : "N/A"}
        </div>
      ),
    },
    {
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: "Actions",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            className="btn-icon btn-secondary btn-sm"
            onClick={() => handleOpenEditModal(r)}
            title="Edit User"
          >
            <Edit2 size={14} />
          </button>

          <button
            className={`btn btn-sm ${r.status === "active" ? "btn-secondary" : "btn-success"}`}
            onClick={() => handleToggleStatus(r)}
            title={r.status === "active" ? "Deactivate User" : "Activate User"}
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
          >
            {r.status === "active" ? <UserX size={14} color="#ef4444" /> : <UserCheck size={14} />}
          </button>

          {r._id !== currentUser?._id && (
            <button
              className="btn-icon btn-secondary btn-sm"
              onClick={() => {
                setDeleteTargetId(r._id);
                setIsDeleteOpen(true);
              }}
              style={{ color: "#ef4444", border: "none" }}
              title="Delete User"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Page Header Banner */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.375rem", margin: "0 0 0.25rem" }}>
            Users / Employee Management
          </h2>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <UserPlus size={18} /> Add New Employee
        </button>
      </div>

      {/* Users Data Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Users size={20} color="var(--primary-600)" /> Registered Employees List
          </h3>
        </div>

        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          searchKey="name"
          placeholder="Search employee by name..."
        />
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUserId ? "Edit Employee Details" : "Add New Employee"}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <span className="spinner" /> : editingUserId ? "Save Changes" : "Create User"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          {modalError && (
            <div
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "var(--radius-md)",
                color: "#b91c1c",
                fontSize: "0.875rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 500,
              }}
            >
              <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{modalError}</span>
            </div>
          )}

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Employee Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Employee ID <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="EMP001"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Office Email <span className="required-star">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="john@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password {!editingUserId && <span className="required-star">*</span>} 
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  style={{ paddingRight: "2.5rem" }}
                  placeholder={editingUserId ? "Password" : "Create Password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingUserId}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Mobile Number <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="9876543210"
                value={form.mobileNumber}
                onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Joining Date <span className="required-star">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={form.joiningDate}
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">User (Employee)</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Allotted Leaves <span className="required-star">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                value={form.allotedLeaves}
                onChange={(e) => setForm({ ...form, allotedLeaves: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        message="Are you sure you want to delete this employee account? They will no longer be able to log in or request leaves."
      />
    </div>
  );
};

export default UsersModule;
