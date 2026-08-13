import React from "react";
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message, loading = false }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : "Confirm Delete"}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#64748b" }}>
        <AlertTriangle size={36} color="#ef4444" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: "0.95rem" }}>{message || "Are you sure you want to delete this item? This action cannot be undone."}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
