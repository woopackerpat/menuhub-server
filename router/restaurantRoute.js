const express = require('express');
const restaurantController = require('../controllers/restaurantController')

const router = express.Router();

// Fetch All Ordered
router.get('/all', restaurantController.fetchAllRestaurantsOrdered)

// Fetch My Draft
router.get('/mydraft', restaurantController.fetchMyDraftRestaurants)

// Fetch my Created Restaurants
router.get('/mycreated', restaurantController.fetchMyCreatedRestaurants)

// Init a restaurant
router.post('/new', restaurantController.createRestaurant)

module.exports = router;