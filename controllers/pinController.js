const createError = require("../utils/createError")
const { User, Pin, Restaurant, Menu } = require("../models")

exports.createPin = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { name, restaurantId } = req.body

    const newPin = await Pin.create({
      name,
      userId,
    })

    if (restaurantId) {
      const restaurantToAdd = await Restaurant.findOne({
        where: {
          id: restaurantId,
        },
      })
      await newPin.addRestaurant(restaurantToAdd)
    }

    res.status(201).json(newPin)
  } catch (err) {
    next(err)
  }
}
exports.updatePin = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { name, pinId } = req.body

    console.log(pinId)

    const foundPin = await Pin.findOne({
      where: {
        id: pinId,
        userId,
      },
      include: {
        model: Restaurant,
        as: "Restaurants",
      },
    })

    foundPin.name = name

    const updatedPin = await foundPin.save()

    res.status(200).json(updatedPin)
  } catch (err) {
    next(err)
  }
}
exports.destroyPin = async (req, res, next) => {
  try {
    const userId = req.user.id
    const pinId = req.query.pinId

    const pinToDestroy = await Pin.findOne({
      where: {
        id: pinId,
        userId,
      },
    })

    await pinToDestroy.destroy()

    res.status(204).json()
  } catch (err) {
    next(err)
  }
}
exports.getMyPins = async (req, res, next) => {
  try {
    const userId = req.user.id

    const myPins = await Pin.findAll({
      where: {
        userId,
      },
      include: {
        model: Restaurant,
        as: "Restaurants",
        include: {
          model: Menu,
          as: "Menus",
          attributes: ["imageUrl", "orderNumber"],
        },
      },
      order: [[Restaurant, Menu, 'orderNumber', 'ASC']]
    })

    res.status(200).json(myPins)
  } catch (err) {
    next(err)
  }
}
exports.getMyPinById = async (req, res, next) => {
  try {
    const userId = req.user.id
    const pinId = req.query.pinid
    // const {pinId} = req.body

    const pinById = await Pin.findOne({
      where: {
        id: pinId,
        userId,
      },
      include: {
        model: Restaurant,
        as: "Restaurants",
        include: {
          model: Menu,
          as: "Menus",
        },
      },
      order: [[Restaurant, Menu, 'orderNumber', 'ASC']]
    })

    if (!pinById) {
      createError("This pin does not exist nor belongs to you", 400)
    }

    res.status(200).json(pinById)
  } catch (err) {
    next(err)
  }
}
exports.getPinSuggestions = async (req, res, next) => {
  try {
    const userId = req.user.id

    const allPins = await Pin.findAll({
      where: {
        userId,
      },
      attributes: ["id", "name", "createdAt"],
      order: [['createdAt', 'ASC']]
    })

    // console.log(allPins)
    res.status(200).json(allPins)
  } catch (err) {
    next(err)
  }
}

// Pin_Restaurant
exports.addToPin = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { restaurantId, pinId } = req.body

    const restaurantToAdd = await Restaurant.findOne({
      where: {
        id: restaurantId,
      },
    })

    const foundPin = await Pin.findOne({
      where: {
        id: pinId,
        userId,
      },
      include: {
        model: Restaurant,
        as: "Restaurants",
      },
    })

    await foundPin.addRestaurant(restaurantToAdd)
    const updatedPin = await Pin.findOne({
      where: {
        id: pinId,
        userId,
      },
      include: {
        model: Restaurant,
        as: "Restaurants",
      },
    })

    res.status(201).json(updatedPin)
  } catch (err) {
    next(err)
  }
}
exports.removeFromPin = async (req, res, next) => {
  try {
    const userId = req.user.id
    const restaurantId  = req.query.restaurantId
    const pinId = req.query.pinId

    const foundPin = await Pin.findOne({
      where: {
        id: pinId,
        userId,
      },
      include: {
        model: Restaurant,
        as: "Restaurants",
      },
    })

    const foundRestaurant = await Restaurant.findOne({
      where: {
        id: restaurantId,
      },
    })

    if (!foundRestaurant) {
      createError("This restaurant does not exist", 400)
    }

    await foundPin.removeRestaurant(foundRestaurant)

    const updatedPin = await Pin.findOne({
      where: {
        id: pinId,
        userId,
      },
      include: {
        model: Restaurant,
        as: "Restaurants",
      },
    })

    res.status(200).json(updatedPin)
  } catch (err) {
    next(err)
  }
}
