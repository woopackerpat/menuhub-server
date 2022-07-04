const { Restaurant, Menu, User, Like, Category } = require('../models');
const createError = require('../utils/createError');

// Fetch All Restaurants
exports.fetchAllRestaurantsOrdered = async (req, res, next) => {
  try {
    const currentPage = req.query.page
    const limit = (req.query.limit*1)
    const nextPage = (currentPage*1) + 1

    const offset = (currentPage-1) * limit
    // const limit = 30
    console.log(offset)
    console.log(limit)

    const totalRecords = await Restaurant.count({
      where: {
        isDraft: false
      }
    })

    // const totalPages = Math.ceil(totalRecords/30) 

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
          attributes: ["id", "firstName", "lastName", 'profilePicUrl']
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
      order: [['isOfficial', 'DESC'], ['createdAt', 'DESC'], [Menu, 'orderNumber', 'ASC']],
      offset, 
      limit
    });

    // const hasRestaurant = allRestaurant.length;

    res.status(201).json({ allRestaurant, nextPage, totalRecords });
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
        }
        // {
        //   model: Like,
        //   as: 'Likes'
        // }
      ],
      order: [['isOfficial', 'DESC'],['createdAt', 'DESC'], [Menu, 'orderNumber', 'ASC']],
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
      order: [['isOfficial', 'DESC'], ['createdAt', 'DESC'], [Menu, 'orderNumber', 'ASC']],
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
    const { name, longitude, latitude, googleId, lineId, number, address, isRequest, categoryArr, websiteUrl } = req.body;

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
      number,
      lineId,
      address,
      userId,
      isRequest,
      websiteUrl
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
    const { name, longitude, latitude, googleId, isRequest, isDraft, categoryArr, websiteUrl, number, lineId } = req.body;

    const resRemoveCat = await Restaurant.findOne({
      where: {
        id: restaurantId,
        userId
      },
      include: {
        model: Category
      }
    });

    if (resRemoveCat.Category) {
      const catRemove = await Category.findAll({
        include: {
          model: Restaurant,
          where: {
            id: restaurantId
          }
        }
      })
  
      await resRemoveCat.removeCategory(catRemove)
  
      await resRemoveCat.save()
    }

    const restaurantToUpdate = await Restaurant.findOne({
      where: {
        id: restaurantId,
        userId
      },
      include: {
        model: Category
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
      restaurantToUpdate.isRequest = isRequest
    }
    if (isDraft === 'publish') {
      restaurantToUpdate.isDraft = true
    }
    if (isDraft === 'unpublish') {
      restaurantToUpdate.isDraft = false
    }
    if (websiteUrl) {
      restaurantToUpdate.websiteUrl = websiteUrl
    }
    if (number) {
      restaurantToUpdate.number = number
    }
    if (lineId) {
      restaurantToUpdate.lineId = lineId
    }
    
    await restaurantToUpdate.save()
    
    if (categoryArr) {
      const catLength = await categoryArr.length
  
  
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
    }
    


    const updatedRestaurant = await Restaurant.findOne({
      where: {
        id: restaurantId,
        userId
      },
      include: {
        model: Category
      }
    });

    console.log(restaurantToUpdate)
    console.log(updatedRestaurant)

    res.status(201).json({ updatedRestaurant });
  } catch (err) {
    next(err)
  }
}

exports.click = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantid

    const toClick = await Restaurant.findOne({
      where: {
        id: restaurantId
      }
    });

    if (!toClick) {
      createError('This restaurant does not exist', 404)
    }

    toClick.click = (toClick.click + 1)
    
    await toClick.save()

    res.status(200).json()
  } catch(err) {
    next(err)
  }
}

exports.approve = async (req, res, next) => {
  try {
    const id = req.params.restaurantid
    const {approve} = req.body
    const updatedRestaurant = await Restaurant.findOne({
      where: {
        id
      }
    })
    console.log(approve)
    if (approve) {
      updatedRestaurant.isRequest = false
      updatedRestaurant.isOfficial = true
      await updatedRestaurant.save()
      res.status(200).json({isApproved: 1})
    }
    if (!approve) {
      updatedRestaurant.isRequest = false
      updatedRestaurant.isOfficial = false
      await updatedRestaurant.save()
      res.status(200).json({isApproved: 0})
    }
  } catch (err) {
    next(err)
  }
}

exports.fetchRequests = async (req, res, next) => {
  try {
    const isRequest = await Restaurant.findAll({
      where: {
        isRequest: 1
      }
    })

    res.status(200).json(isRequest)
  } catch (err) {
    next(err)
  }
}