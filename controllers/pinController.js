const createError = require("../utils/createError");
const { User, Pin, Restaurant } = require('../models')

exports.createPin = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { name, restaurantId } = req.body

        const newPin = await Pin.create({
            name,
            userId
        });

        if (restaurantId) {
            const restaurantToAdd = await Restaurant.findOne({
                where: {
                    id: restaurantId
                }
            });
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
                userId
            },
            include: {
                model: Restaurant,
                as: 'Restaurants'
            }
        });

        foundPin.name = name

        const updatedPin = await foundPin.save()

        res.status(200).json(updatedPin)
    } catch (err) {
        next(err)
    }
}
exports.destroyPin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { pinId } = req.body;

        const pinToDestroy = await Pin.findOne({
            where: {
                id: pinId,
                userId,
            }
        });

        await pinToDestroy.destroy()

        res.status(204).json();
    } catch (err) {
        next(err)
    }
}
exports.getMyPins = async (req, res, next) => {
    try {
        const userId = req.user.id

        const myPins = await Pin.findAll({
            where: {
                userId
            },
            include: {
                model: Restaurant,
                as: 'Restaurants'
            }
        });

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
                userId
            },
            include: {
                model: Restaurant,
                as: 'Restaurants'
            }
        });

        if (!pinById) {
            createError('This pin does not exist nor belongs to you', 400)
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
                userId
            },
            attributes: ["id", "name"]
        });

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
                id: restaurantId
            }
        });

        const foundPin = await Pin.findOne({
            where: {
                id: pinId,
                userId
            },
            include: {
                model: Restaurant,
                as: 'Restaurants'
            }
        });

	console.log(foundPin)
	console.log(restaurantToAdd)
        await foundPin.addRestaurant(restaurantToAdd)
        const updatedPin = await Pin.findOne({
            where: {
                id: pinId,
                userId
            },
            include: {
                model: Restaurant,
                as: 'Restaurants'
            }
        });

        res.status(201).json(updatedPin)
    } catch (err) {
        next(err)
    }
}
exports.removeFromPin = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { pinId, restaurantId } = req.body

        const foundPin = await Pin.findOne({
            where: {
                id: pinId,
                userId
            },
            include: {
                model: Restaurant,
                as: 'Restaurants'
            }
        });

        const foundRestaurant = await Restaurant.findOne({
            where: {
                id: restaurantId
            }
        });

        if (!foundRestaurant) {
            createError('This restaurant does not exist', 400)
        }

        await foundPin.removeRestaurant(foundRestaurant)

        const updatedPin = await Pin.findOne({
            where: {
                id: pinId,
                userId
            },
            include: {
                model: Restaurant,
                as: 'Restaurants'
            }
        });

        res.status(200).json(updatedPin)
    } catch (err) {
        next(err)
    }
}
