import React, { useState, useEffect } from "react";
import { Search, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

const DataTable = ({
  columns,
  data = [],
  loading,
  searchKey,
  placeholder = "Search...",
  pageSize = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page to 1 when search term or data length changes
  const dataLength = data ? data.length : 0;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dataLength]);

  const filteredData = (data || []).filter((item) => {
    if (!searchTerm || !searchKey) return true;
    const value = item[searchKey];
    if (typeof value === "string") {
      return value.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = filteredData.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

  const startIndex = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, totalItems);

  const getPageNumbers = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }
    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  return (
    <div style={{ width: "100%" }}>
      {searchKey && (
        <div style={{ marginBottom: "1rem", position: "relative", width: "100%", maxWidth: "320px" }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: "2.5rem", width: "100%" }}
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || "auto" }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "3rem" }}>
                  <div className="spinner spinner-dark" style={{ margin: "0 auto 0.5rem" }} />
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading data...</p>
                </td>
              </tr>
            ) : paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={row._id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <Inbox className="empty-icon" />
                    <p style={{ fontWeight: 600, color: "#334155" }}>No records found</p>
                    <p style={{ fontSize: "0.8125rem" }}>There are no items matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalItems > pageSize && (
        <div className="pagination-wrapper">
          <div className="pagination-info">
            Showing <span>{startIndex}</span> to <span>{endIndex}</span> of <span>{totalItems}</span> entries
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={validCurrentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <div className="pagination-pages">
              {getPageNumbers(validCurrentPage, totalPages).map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`pagination-page-num ${p === validCurrentPage ? "active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={validCurrentPage === totalPages}
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
