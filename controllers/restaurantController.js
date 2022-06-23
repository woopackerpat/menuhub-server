const { Restaurant, Menu, User } = require('../models');
const createError = require('../utils/createError');

// Fetch All Restaurants
exports.fetchAllRestaurantsOrdered = async (req, res, next) => {
  try {
    const allRestaurant = await Restaurant.findAll({
      where: {
        isDraft: false,
      },
      include: [
        {
          model: Menu,
          as: 'Menus',
          attributes: ["orderNumber", "imageUrl"],
        },
        {
          model: User,
          attributes: ["id", "firstName", "lastName"]
        }
      ],
      order: [['isOfficial', 'DESC'], [Menu, 'orderNumber', 'ASC']],
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
      include: [
        {
          model: Menu,
          as: 'Menus',
          attributes: ["orderNumber", "imageUrl"],
        },
        {
          model: User,
          attributes: ["id", "firstName", "lastName"]
        }
      ],
      order: [['isOfficial', 'DESC'], [Menu, 'orderNumber', 'ASC']],
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
      include: [
        {
          model: Menu,
          as: 'Menus',
          attributes: ["orderNumber", "imageUrl"],
        },
        {
          model: User,
          attributes: ["id", "firstName", "lastName"]
        }
      ],
      order: [['isOfficial', 'DESC'], [Menu, 'orderNumber', 'ASC']],
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
    // console.log(userId);
    // console.log(req.body);

    const { name, longitude, latitude, googleId, category, isRequest } = req.body;

    if (!name) {
      createError('Name is required', 400);
    } if (!category) {
      createError('Category is requried', 400);
    }

    const createdRestaurant = await Restaurant.create({
      name,
      longitude,
      latitude,
      googleId,
      category,
      userId,
      isRequest
    });

    const restaurantIdForMenus = createdRestaurant.id;
    const restaurantNameForMenus = createdRestaurant.name;

    res.status(201).json({ restaurantIdForMenus, restaurantNameForMenus });
  } catch (err) {
    next(err);
  }
};

exports.fetchRestaurantById = async (req, res, next) => {
  try {

    const restaurantId = req.params.restaurantid

    const foundRestaurant = await Restaurant.findOne({
      where: {
        id: restaurantId
      },
      include: [
        {
          model: Menu,
          as: 'Menus',
          attributes: ["orderNumber", "imageUrl"],
        },
        {
          model: User,
          attributes: ["id", "firstName", "lastName"]
        }
      ],
      order: [['isOfficial', 'DESC'], [Menu, 'orderNumber', 'ASC']],
    });

    if (!foundRestaurant) {
      createError('This restaurant does not exist', 404)
    }

    res.status(200).json({ foundRestaurant });
  } catch (err) {
    next(err)
  }
}

exports.updateRestaurant = async (req, res, next) => {
  try {

    const userId = req.user.id
    const restaurantId = req.params.restaurantid
    const { name, longitude, latitude, googleId, category, isRequest, isDraft } = req.body;

    const restaurantToUpdated = await Restaurant.findOne({
      where: {
        id: restaurantId,
        userId
      }
    });

    if (!restaurantToUpdated) {
      createError('This restaurant does not exist', 400)
    }

    if (name) {
      restaurantToUpdated.name = name
    } 
    if (longitude) {
      restaurantToUpdated.longitude = longitude
    }
    if (latitude) {
      restaurantToUpdated.latitude = latitude
    } 
    if (googleId) {
      restaurantToUpdated.googleId = googleId
    }
    if (category) {
      restaurantToUpdated.category = category
    } 
    if (isRequest) {
      restaurantToUpdated.isRequest = category
    }
    if (isDraft) {
      restaurantToUpdated.isDraft = isDraft
    }

    const updatedRestaurant = await restaurantToUpdated.save()

    res.status(201).json({ updatedRestaurant });
  } catch (err) {
    next(err)
  }
}