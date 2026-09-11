const { sendError } = require('../utils/apiResponse');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

module.exports = { authorize };
