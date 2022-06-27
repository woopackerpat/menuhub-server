const { Restaurant, Menu, User, Like, Category } = require('../models');
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
        }, 
        {
          model: Category,
          as: 'Categories'
        },
        {
          model: Like,
          as: 'Likes'
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
        },
        {
          model: Category,
          as: 'Categories'
        },
        {
          model: Like,
          as: 'Likes'
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
        },
        {
          model: Category,
          as: 'Categories'
        },
        {
          model: Like,
          as: 'Likes'
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
    const { name, longitude, latitude, googleId, isRequest, categoryArr } = req.body;

    if (!name) {
      createError('Name is required', 400);
    } if (!categoryArr) {
      createError('Category is requried', 400);
    }

    const lowercase = name.toLowerCase()

    const createdRestaurant = await Restaurant.create({
      name,
      lowercase,
      longitude,
      latitude,
      googleId,
      userId,
      isRequest
    });

    const restaurantIdForMenus = createdRestaurant.id;
    const restaurantNameForMenus = createdRestaurant.name;

    if (categoryArr) {
      const catLength = categoryArr.length
      for (let i = 0 ; i < catLength ; i++) {
        
        let foundCat = await Category.findOne({
          where: {
            name: categoryArr[i] 
          }
        });

        if (foundCat) {
          await createdRestaurant.addCategory(foundCat)
        }

        if (!foundCat) {
          createError(`The category ${categoryArr[i]} does not exist`, 400)
        }
      }
    }

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
        },
        {
          model: Category,
          as: 'Categories'
        },
        {
          model: Like,
          as: 'Likes'
        }
      ],
      order: [['isOfficial', 'DESC'], [Menu, 'orderNumber', 'ASC']],
    });

    const likes = await Like.findAll({
      where: {
        restaurantId
      }
    })

    const nLikes = likes.length

    if (!foundRestaurant) {
      createError('This restaurant does not exist', 404)
    }

    res.status(200).json({ 'Restaurant': foundRestaurant, 'Number of Likes': nLikes });
  } catch (err) {
    next(err)
  }
}

exports.updateRestaurant = async (req, res, next) => {
  try {

    const userId = req.user.id
    const restaurantId = req.params.restaurantid
    const { name, longitude, latitude, googleId, isRequest, isDraft, categoryArr } = req.body;

    const restaurantToUpdate = await Restaurant.findOne({
      where: {
        id: restaurantId,
        userId
      }
    });

    if (!restaurantToUpdate) {
      createError('This restaurant does not exist', 400)
    }

    if (name) {
      restaurantToUpdate.name = name
      restaurantToUpdate.lowercase = name.toLowerCase()
    } 
    if (longitude) {
      restaurantToUpdate.longitude = longitude
    }
    if (latitude) {
      restaurantToUpdate.latitude = latitude
    } 
    if (googleId) {
      restaurantToUpdate.googleId = googleId
    }
    if (isRequest) {
      restaurantToUpdate.isRequest = category
    }
    if (isDraft) {
      restaurantToUpdate.isDraft = isDraft
    }

    const catLength = categoryArr.length
    for (let i = 0 ; i < catLength ; i++) {
      let foundCat = await Category.findOne({
        where: {
          name: categoryArr[i] 
        }
      });

      if (foundCat) {
        await restaurantToUpdate.addCategory(foundCat)
      }

      if (!foundCat) {
        createError(`The category ${categoryArr[i]} does not exist`, 400)
      }
    }


    const updatedRestaurant = await restaurantToUpdate.save()

    res.status(201).json({ updatedRestaurant });
  } catch (err) {
    next(err)
  }
}