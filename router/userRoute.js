const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/me', userController.getMe);
router.get('/:userId', userController.getUserById);
router.patch('/', userController.updateUser);
router.delete('/', userController.deleteUser);

module.exports = router;
