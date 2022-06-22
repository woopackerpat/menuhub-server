const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const menuController = require('../controllers/menuController');
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

// Creating a new restaurant
// Init a restaurant
router.post('/new', authenticate, restaurantController.createRestaurant);

router.post('/menu/new/:restaurantid', authenticate, menuController.createMenu)

module.exports = router;
