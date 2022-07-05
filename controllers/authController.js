const createError = require('../utils/createError');
const bcrypt = require('bcryptjs');
const { User, Pin } = require('../models');
const jwt = require('jsonwebtoken');
// const { Op } = require('sequelize');

const genToken = payload =>
  jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.googleLogin = async (req, res, next) => {
  try {
    const { googleData } = req.body;
    const payload = jwt.decode(googleData);
    const existingUser = await User.findOne({
      where: { googleId: payload.sub },
    });
    if (!existingUser) {
      const newUser = await User.create({
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        profilePicUrl: payload.picture,
        googleId: payload.sub,
      });
      await Pin.create({
        name: 'My first board',
        userId: newUser.id
      })
    }
    const user = await User.findOne({
      where: { googleId: payload.sub },
    });
    const token = genToken({ id: user.id });
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      createError('invalid credential', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      createError('invalid credential', 400);
    }

    const token = genToken({ id: user.id });
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!email) {
      createError('email is required', 400);
    }
    if (!password) {
      createError('password is required', 400);
    }
    if (password.length < 6) {
      createError('password must be longer than 6 characters');
    }
    if (password !== confirmPassword) {
      createError('password and confirm password did not match', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const defaultPin = await Pin.create({
      name: 'My first board',
      userId: user.id
    })

    const token = genToken({ id: user.id });
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};
