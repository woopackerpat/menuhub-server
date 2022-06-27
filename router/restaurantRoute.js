const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const menuController = require('../controllers/menuController');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');
const searchController = require('../controllers/searchController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Fetch All Ordered
router.get('/all', restaurantController.fetchAllRestaurantsOrdered);

// Fetch by Id
router.get('/get/:restaurantid', restaurantController.fetchRestaurantById)

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

router.get('/menuall/:restaurantid', menuController.fetchMenus)
router.get('/menu/:menuid', menuController.fetchMenuById)
router.post('/menu/:restaurantid', authenticate, menuController.createMenu)
router.patch('/menu/:menuid', authenticate, menuController.updateMenu)
router.delete('/menu/:menuid', authenticate, menuController.destroyMenu)

router.post('/comment', authenticate, commentController.addComment)
router.patch('/comment', authenticate, commentController.updateComment)
router.delete('/comment', authenticate, commentController.deleteComment)

router.put('/like/:restaurantid', authenticate, likeController.cycleLike)

router.get('/suggestions', searchController.suggestions)
router.get('/search', searchController.search)

module.exports = router;
