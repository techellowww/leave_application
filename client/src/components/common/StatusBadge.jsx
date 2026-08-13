import React from "react";
import { CheckCircle2, Clock, XCircle, UserCheck, UserX } from "lucide-react";

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  switch (normalized) {
    case "approved":
    case "active":
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={13} />
          {status}
        </span>
      );
    case "pending":
      return (
        <span className="badge badge-warning">
          <Clock size={13} />
          {status}
        </span>
      );
    case "rejected":
    case "inactive":
      return (
        <span className="badge badge-danger">
          <XCircle size={13} />
          {status}
        </span>
      );
    case "casual":
      return <span className="badge badge-info">Casual</span>;
    case "sick":
      return <span className="badge badge-warning">Sick</span>;
    case "admin":
      return <span className="badge badge-neutral" style={{ background: "#ede9fe", color: "#6d28d9" }}>Admin</span>;
    case "user":
      return <span className="badge badge-neutral">User</span>;
    default:
      return <span className="badge badge-neutral">{status}</span>;
  }
};

export default StatusBadge;
