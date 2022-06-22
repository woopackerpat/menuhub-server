const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Fetch All Ordered
router.get('/all', restaurantController.fetchAllRestaurantsOrdered);

// Fetch My Draft
router.get(
  '/mydraft',
  authenticate,
  restaurantController.fetchMyDraftRestaurants
);

// Fetch my Created Restaurants
router.get(
  '/mycreated',
  authenticate,
  restaurantController.fetchMyCreatedRestaurants
);

// Init a restaurant
router.post('/new', authenticate, restaurantController.createRestaurant);

module.exports = router;
