const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const menuController = require('../controllers/menuController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Fetch All Ordered
router.get('/all', restaurantController.fetchAllRestaurantsOrdered);

// Fetch by Id
router.get('/:restaurantid', restaurantController.fetchRestaurantById)

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
router.patch('/:restaurantid', authenticate, restaurantController.updateRestaurant)

router.post('/menu/new/:restaurantid', authenticate, menuController.createMenu)
router.patch('/menu/update/:menuid', authenticate, menuController.updateMenu)
router.delete('/menu/delete/:menuid', authenticate, menuController.destroyMenu)

module.exports = router;
