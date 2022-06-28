const { Restaurant, Menu, User, Comment } = require('../models');
const createError = require('../utils/createError');

exports.createMenu = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantid;
    const { title, imageUrl, description, orderNumber } = req.body;

    // Validation
    if (!title) {
      createError('Requires a Title', 400);
    }
    if (!imageUrl) {
      createError('Requires an Image', 400);
    }
    if (!description) {
      createError('Requires a Description', 400);
    }
    if (!orderNumber) {
      createError('Requires an Order Number', 400);
    }
    if (!restaurantId) {
      createError('Requires a Restaurant ID', 400);
    }

    const newMenu = await Menu.create({
      restaurantId,
      title,
      imageUrl,
      description,
      orderNumber,
      include: {
        model: Restaurant,
        attributes: ['name'],
      },
    });

    res.status(201).json({ newMenu });
  } catch (err) {
    next(err);
  }
};

exports.updateMenu = async (req, res, next) => {
  try {
    const menuId = req.params.menuid;

    const { title, imageUrl, description, orderNumber } = req.body;

    const toUpdateMenu = await Menu.findOne({
      where: {
        id: menuId,
      },
      include: {
        model: Restaurant,
        attributes: ['name'],
      },
    });

    if (!toUpdateMenu) {
      createError('This Menu does not exist', 400)
    }

    if (title) {
      toUpdateMenu.title = title;
    }
    if (imageUrl) {
      toUpdateMenu.imageUrl = imageUrl;
    }
    if (description) {
      toUpdateMenu.description = description;
    }
    if (orderNumber) {
      toUpdateMenu.orderNumber = orderNumber;
    }

    const updatedMenu = await toUpdateMenu.save();

    res.status(201).json({ updatedMenu, message: 'Up to Date' });
  } catch (err) {
    next(err);
  }
};

exports.destroyMenu = async (req, res, next) => {
  try {
    const menuId = req.params.menuid;

    const menuToDelete = await Menu.findOne({
      where: {
        id: menuId,
      },
    });

    await menuToDelete.destroy();

    res.status(204).json();
  } catch (err) {
    next(err);
  }
};

exports.fetchMenus = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantid

    const foundMenus = await Menu.findAll({
      where: {
        restaurantId
      },
      include: [
        {
          model: Restaurant,
        },
        {
          model: Comment,
          as: 'Comments',
          include: {
            model: User,
          }
        }
      ]
    });

    const restaurant = await Restaurant.findOne({
      where: {
        id: restaurantId
      }
    })

    const userId = restaurant.dataValues.userId
    console.log(userId)
    const user = await User.findOne({
      where: {
        id: userId
      },
      attributes: ["id", "firstName", "lastName"]

    })


    const hasMenus = foundMenus.length

    const result = {
      "Menus": foundMenus,
      "hasMenus": hasMenus,
      "Creator": user
    }

    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

exports.fetchMenuById = async (req, res, next) => {
  try {
    const menuId = req.params.menuid

    const menu = await Menu.findOne({
      where: {
        id: menuId
      }
    })

    console.log(menu)
    if (!menu) {
      createError('This menu does not exist', 400)
    }
    const restaurantId = menu.dataValues.restaurantId
    
    const restaurant = await Restaurant.findOne({
      where: {
        id: restaurantId
      }
    })

    const userId = restaurant.dataValues.userId

    const user = await User.findOne({
      where: {
        id: userId
      },
      attributes: ["id", "firstName", "lastName"]
    })

    const comments = await Comment.findAll({
      where: {
        menuId
      },
      include: {
        model: User,
        attributes: ['firstName', 'lastName', 'id']
      }
    })

    const result = {
      "Menu": menu,
      "Restaurant": restaurant,
      "Creator": user,
      "Comments": comments
    }

    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}