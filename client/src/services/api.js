import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("leave_app_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("leave_app_token");
      localStorage.removeItem("leave_app_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/* ---------------- Auth Endpoints ---------------- */
export const loginUser = async (credentials) => {
  const res = await api.post("/user/login", credentials);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/user/me");
  return res.data;
};

/* ---------------- Dashboard Endpoints ---------------- */
export const getLeaveSummary = async () => {
  const res = await api.get("/dashboard/leave-summary");
  return res.data;
};

export const getMonthlySummary = async (month, year) => {
  const res = await api.get(`/dashboard/monthly-summary?month=${month}&year=${year}`);
  return res.data;
};

export const getDateWiseReport = async (fromDate, toDate) => {
  const res = await api.get(`/dashboard/report/date-wise?fromDate=${fromDate}&toDate=${toDate}`);
  return res.data;
};

export const getSingleEmployeeReport = async (employeeId, fromDate = "", toDate = "") => {
  let url = `/dashboard/report/employee/${employeeId}`;
  if (fromDate && toDate) {
    url += `?fromDate=${fromDate}&toDate=${toDate}`;
  }
  const res = await api.get(url);
  return res.data;
};

export const getAllEmployeesReport = async (fromDate = "", toDate = "") => {
  let url = `/dashboard/report/all-employees`;
  if (fromDate && toDate) {
    url += `?fromDate=${fromDate}&toDate=${toDate}`;
  }
  const res = await api.get(url);
  return res.data;
};

/* ---------------- Leave Endpoints ---------------- */
export const getLeaves = async () => {
  const res = await api.get("/leave");
  return res.data;
};

export const getLeaveById = async (id) => {
  const res = await api.get(`/leave/${id}`);
  return res.data;
};

export const createLeave = async (leaveData) => {
  const res = await api.post("/leave", leaveData);
  return res.data;
};

export const updateLeave = async (id, leaveData) => {
  const res = await api.put(`/leave/${id}`, leaveData);
  return res.data;
};

export const deleteLeave = async (id) => {
  const res = await api.delete(`/leave/${id}`);
  return res.data;
};

/* ---------------- Users Endpoints ---------------- */
export const getUsers = async () => {
  const res = await api.get("/user");
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/user/${id}`);
  return res.data;
};

export const createUser = async (userData) => {
  const res = await api.post("/user", userData);
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await api.put(`/user/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/user/${id}`);
  return res.data;
};

/* ---------------- Holiday Endpoints ---------------- */
export const getHolidays = async () => {
  const res = await api.get("/holiday");
  return res.data;
};

export const createHoliday = async (holidayData) => {
  const res = await api.post("/holiday", holidayData);
  return res.data;
};

export const updateHoliday = async (id, holidayData) => {
  const res = await api.put(`/holiday/${id}`, holidayData);
  return res.data;
};

export const deleteHoliday = async (id) => {
  const res = await api.delete(`/holiday/${id}`);
  return res.data;
};

export default api;
