const express = require('express');
const authenticate = require('../middlewares/authenticate');
const categoryController = require('../controllers/categoryController')

const router = express.Router();

router.post('', categoryController.createCategory)
router.delete('', categoryController.destroyCategory)
router.get('', categoryController.getCategories)

module.exports = router