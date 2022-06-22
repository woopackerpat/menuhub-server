const { Restaurant, Menu } = require('../models');

// Fetch All Restaurants
exports.fetchAllRestaurantsOrdered = async (req, res, next) => {
  try {
    const allRestaurant = await Restaurant.findAll({
      where: {
        isDraft: false,
      },
      order: [['isOfficial', 'DESC']],
      // include: {
      //   model: Menu,
      //   as: 'firstMenu',
      //   where: {
      //     orderNumber: 1,
      //   },
      // },
    });

    res.status(201).json({ allRestaurant });
  } catch (err) {
    next(err);
  }
};

// Fetch my Draft Restaurant
exports.fetchMyDraftRestaurants = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const foundMyDraftRestaurants = await Restaurant.findAll({
      where: {
        userId,
        isDraft: true,
      },
    });

    res.status(201).json({ foundMyDraftRestaurants });
  } catch (err) {
    next(err);
  }
};

// Fetch my Created Restaurant
exports.fetchMyCreatedRestaurants = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const myCreatedRestaurants = await Restaurant.findAll({
      where: {
        userId,
        isDraft: false,
      },
    });
    const hasRestaurant = myCreatedRestaurants.length;

    res.status(201).json({ myCreatedRestaurants, hasRestaurant });
  } catch (err) {
    next(err);
  }
};

// Init a restaurant/album
exports.createRestaurant = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    console.log(req.body);

    const { name, longitude, latitude, googleId, category } = req.body;

    const createdRestaurant = await Restaurant.create({
      name,
      longitude,
      latitude,
      googleId,
      category,
      userId,
    });

    const restaurantIdForMenus = createdRestaurant.id;

    res.status(201).json({ restaurantIdForMenus });
  } catch (err) {
    next(err);
  }
};
