const jwt = require('jsonwebtoken');
const createError = require('../utils/createError');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const isAdmin = req.user.role
    if (isAdmin === 'User') {
        createError('You are unautherized', 401)
    }
    next();
  } catch (err) {
    next(err);
  }
};