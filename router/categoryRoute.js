const express = require('express');
const authenticate = require('../middlewares/authenticate');
const categoryController = require('../controllers/categoryController')

const router = express.Router();

router.post('', categoryController.createCategory)
router.patch('', categoryController.destroyCategory)

module.exports = router