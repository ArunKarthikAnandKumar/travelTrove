const jwt = require('jsonwebtoken');
const userModel = require('../model/users');

let authMiddleware = {};

// Verify JWT token and attach user to request
authMiddleware.isAuthenticated = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('No token provided');
      err.status = 401;
      throw err;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const model = await userModel.createUserModel();
    const user = await model.findById(decoded.userId);
    
    if (!user || user.isActive !== 1) {
      const err = new Error('Invalid or inactive user');
      err.status = 401;
      throw err;
    }
    
    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      userName: user.userName,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid token');
      err.status = 401;
      next(err);
    } else if (error.name === 'TokenExpiredError') {
      const err = new Error('Token expired');
      err.status = 401;
      next(err);
    } else {
      next(error);
    }
  }
};

// Check if user is admin
authMiddleware.isAdmin = async (req, res, next) => {
  try {
    // First check if authenticated
    await authMiddleware.isAuthenticated(req, res, () => {});
    
    // Then check if admin
    if (req.user.role !== 'admin') {
      const err = new Error('Access denied. Admin only.');
      err.status = 403;
      throw err;
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Optional: Check if user owns resource
authMiddleware.isOwner = (resourceUserId) => {
  return async (req, res, next) => {
    try {
      await authMiddleware.isAuthenticated(req, res, () => {});
      
      if (req.user.role !== 'admin' && req.user.id !== resourceUserId) {
        const err = new Error('Access denied. You can only access your own resources.');
        err.status = 403;
        throw err;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authMiddleware;
