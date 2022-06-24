const express = require('express');
const authenticate = require('../middlewares/authenticate');
const pinController = require('../controllers/pinController')

const router = express.Router();

router.get('', authenticate, pinController.getMyPins)
router.get('/single', authenticate, pinController.getMyPinById)
router.get('/suggestions', authenticate, pinController.getPinSuggestions)
router.post('', authenticate, pinController.createPin)
router.delete('', authenticate, pinController.destroyPin)
router.patch('', authenticate, pinController.updatePin)

// Pin_Restaurant
router.patch('/restaurant', authenticate, pinController.addToPin)
router.delete('/restaurant', authenticate, pinController.removeFromPin)


module.exports = router;