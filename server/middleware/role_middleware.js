export const authorize = (roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || req.user?.userType;
    if (!userRole || !roles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Forbidden: You don't have access" });
    }
    next();
  };
};
