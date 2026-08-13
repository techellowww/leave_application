import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getHolidays, createHoliday, deleteHoliday } from "../services/api";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useToast } from "../components/common/Toast";
import { Calendar as CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const CalendarPage = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Holiday Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: "", name: "", type: "holiday" });

  // Delete Holiday Confirm Dialog State
  const [deleteHolidayId, setDeleteHolidayId] = useState(null);
  const [deletingHoliday, setDeletingHoliday] = useState(false);

  useEffect(() => {
    fetchHolidaysData();
  }, []);

  const fetchHolidaysData = async () => {
    try {
      setLoading(true);
      const res = await getHolidays();
      setHolidays(res.data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load holidays", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!form.date || !form.name) {
      showToast("Please provide date and holiday name", "error");
      return;
    }
    try {
      setSubmitting(true);
      await createHoliday(form);
      showToast("Holiday added successfully", "success");
      setIsModalOpen(false);
      setForm({ date: "", name: "", type: "holiday" });
      fetchHolidaysData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add holiday", "error");
    } finally {
      setSubmitting(false);
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
      fetchHolidaysData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete holiday", "error");
    } finally {
      setDeletingHoliday(false);
    }
  };

  // Calendar Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Map holidays by date string YYYY-MM-DD
  const holidayMap = {};
  holidays.forEach((h) => {
    const dStr = new Date(h.date).toISOString().split("T")[0];
    holidayMap[dStr] = h;
  });

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
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.375rem", margin: "0 0 0.25rem" }}>
            Company Calendar & Holidays
          </h2>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Holiday / Non-Working Day
          </button>
        )}
      </div>

      {/* Calendar Card */}
      <div className="card">
        {/* Month Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button className="btn-icon btn-secondary" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700 }}>
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button className="btn-icon btn-secondary" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.8125rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#eef2ff", border: "1px solid #c7d2fe" }} />
              Holiday
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2" }} />
              Sunday
            </span>
          </div>
        </div>

        {/* Days of Week Header & Calendar Grid */}
        <div className="calendar-scroll-wrapper">
          <div className="calendar-grid" style={{ minWidth: "320px" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <div key={day} className="calendar-header-day" style={{ color: idx === 0 ? "#ef4444" : "var(--text-muted)" }}>
                {day}
              </div>
            ))}

            {/* Empty padded days before 1st of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              // Format YYYY-MM-DD
              const yyyy = dateObj.getFullYear();
              const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
              const dd = String(dayNum).padStart(2, "0");
              const dateStr = `${yyyy}-${mm}-${dd}`;

              const isSunday = dateObj.getDay() === 0;
              const holiday = holidayMap[dateStr];

              return (
                <div
                  key={dayNum}
                  className={`calendar-day ${isSunday ? "sunday" : ""} ${holiday ? "holiday" : ""}`}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="calendar-day-number" style={{ color: isSunday ? "#ef4444" : "inherit" }}>
                      {dayNum}
                    </span>
                    {holiday && isAdmin && (
                      <button
                        onClick={() => handleDeleteHoliday(holiday._id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0 }}
                        title="Remove Holiday"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {holiday && (
                    <div className="calendar-holiday-tag" title={`${holiday.name} (${holiday.type})`}>
                      {holiday.name}
                    </div>
                  )}
                  {isSunday && !holiday && (
                    <div style={{ fontSize: "0.6875rem", color: "#ef4444", fontWeight: 600 }}>Sunday</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Holiday Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Company Holiday"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddHoliday} disabled={submitting}>
              {submitting ? <span className="spinner" /> : "Save Holiday"}
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
              placeholder="e.g. New Year's Day"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-control"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
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

export default CalendarPage;
