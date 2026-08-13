import React, { useState } from "react";
import { Search, Inbox } from "lucide-react";

const DataTable = ({ columns, data, loading, searchKey, placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data?.filter((item) => {
    if (!searchTerm || !searchKey) return true;
    const value = item[searchKey];
    if (typeof value === "string") {
      return value.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

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
            ) : filteredData && filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
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
    </div>
  );
};

export default DataTable;
