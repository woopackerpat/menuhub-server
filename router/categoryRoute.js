const express = require('express');
const authenticate = require('../middlewares/authenticate');
const categoryController = require('../controllers/categoryController')

const router = express.Router();
