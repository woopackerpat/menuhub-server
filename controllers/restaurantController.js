const { Restaurant, Menu } = require('../models');

// Fetch All Restaurants
exports.fetchAllRestaurantsOrdered = async (req, res, next) => {
  try {
    const allRestaurant = await Restaurant.findAll({
      where: {
        isDraft: false,
      },
      order: [['isOfficial', 'DESC']],
      include: {
        model: Menu,
        as: 'Menus',
        where: {
          orderNumber: 1,
        },
      },
    });

    const hasRestaurant = allRestaurant.length;

    res.status(201).json({ allRestaurant, hasRestaurant });
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
      include: {
        model: Menu,
        as: 'Menus',
      }
    });

    const hasRestaurant = foundMyDraftRestaurants.length;

    res.status(201).json({ foundMyDraftRestaurants, hasRestaurant });

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
      include: {
        model: Menu,
        as: 'Menus',
        where: {
          orderNumber: 1,
        },
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
    const restaurantNameForMenus = createdRestaurant.name;

    res.status(201).json({ restaurantIdForMenus, restaurantNameForMenus });
  } catch (err) {
    next(err);
  }
};
