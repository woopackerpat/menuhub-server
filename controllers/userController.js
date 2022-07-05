const { User } = require('../models');
const createError = require('../utils/createError');

// Get user's personal info
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

// Get user by id
exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({
      where: { id: userId },
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'],
      },
    });

    if (!user) {
      createError('User not found!', 404);
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, profilePicUrl } = req.body;
    const { id } = req.user;

    const user = await User.findOne({
      where: { id },
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'],
      },
    });

    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
      user.lastName = lastName;
    }
    if (profilePicUrl) {
      user.profilePicUrl = profilePicUrl;
    }

    const updatedUser = await user.save();
    res.status(200).json({ updatedUser, message: 'Your profile has been updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await User.findOne({ where: { id } });
    if (!user) {
      createError('User not found!', 404);
    }

    await user.destroy();
    res.status(204).json();
  } catch (err) {
    next(err);
  }
};
