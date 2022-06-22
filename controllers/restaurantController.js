const { Restaurant, Menu } = require('../models')

// Fetch All Restaurants
exports.fetchAllRestaurantsOrdered = async (req, res, next) => {
    try {

        const officialRestaurant = await Restaurant.findAll({
            where: {
                isDraft: false,
                isOfficial: true
            },
            include: {
                model: Menu,
                as: "firstMenu",
                where: {
                    orderNumber: 1
                }
            }
        });

        const unofficialRestaurant = await Restaurant.findAll({
            where: {
                isDraft: false,
                isOfficial: false
            },
            include: {
                model: Menu,
                as: 'firstMenu',
                where: {
                    orderNumber: 1
                }
            }
        })

        const allRestaurant = { ...officialRestaurant, ...unofficialRestaurant }

        res.status(201).json({ allRestaurant })

    } catch (err) {
        console.log('fetchAllRestaurants error')
    }
}

// Fetch my Draft Restaurant
exports.fetchMyDraftRestaurants = async (req, res, next) => {
    try {

        const userId = req.user.id

        const foundMyDraftRestaurants = await Restaurant.findAll({
            where: {
                userId,
                isDraft: true
            }
        })

        res.status(201).json({ foundMyDraftRestaurants })

    } catch (err) {
        console.log('fetchDraftMyRestaurants error')
    }
}

// Fetch my Created Restaurant
exports.fetchMyCreatedRestaurants = async (req, res, next) => {
    try {

        const userId = req.user.id

        const myCreatedRestaurants = await Restaurant.findAll({
            where: {
                userId,
                isDraft: false
            }
        })

        res.status(201).json({ myCreatedRestaurants })

    } catch {
        console.log('fethcMyCreatedRestaurants error')
    }
}

// Init a restaurant/album
exports.createRestaurant = async (req, res, next) => {
    try {

        const userId = req.user.id

        const { name, longitude, latitude, googleId, category } = req.body

        const createdRestaurant = await Restaurant.create({
            name,
            longitude,
            latitude,
            googleId,
            category,
            userId
        })

        const restaurantIdForMenus = createdRestaurant.id

        res.status(201).json({ restaurantIdForMenus })

    } catch (err) {
        console.log('createRestaurant error')
    }
}