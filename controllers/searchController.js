const { Op } = require('sequelize');
const { Restaurant, Menu, User, Category } = require('../models');
const createError = require('../utils/createError');
const geolib = require('geolib')

const totalScore = (refArr, comArr, highClick, currentClick) => {
    const matchArr = refArr.filter(category => comArr.includes(category))
    const matchScore = matchArr.length * 30

    const clickScore = currentClick * 0.5
    return matchScore + clickScore
}

const distanceCalc = (center, lat, lng) => {
    latCenter = center.lat
    lngCenter = center.lng
    return geolib.getDistance(
        { latitude: latCenter, longitude: lngCenter },
        { latitude: lat, longitude: lngCenter }
    )
}

exports.search = async (req, res, next) => {
    try {
        const { search } = req.body

        const lowercaseSearch = search.toLowerCase()

        const foundByName = await Restaurant.findAll({
            where: {
                lowercase: {
                    [Op.substring]: `${lowercaseSearch}`
                }
            }
        });

        res.status(200).json(foundByName)
    } catch (err) {
        next(err)
    }
}

exports.suggestions = async (req, res, next) => {
    try {
        const { refId, name } = req.body

        const refRestaurant = await Restaurant.findOne({
            where: {
                id: refId
            },
            include: {
                model: Category,
                as: "Categories"
            }
        })

        const nameLowercase = name.toLowerCase()

        let allRestaurants = await Restaurant.findAll({
            where: {
                lowercase: {
                    [Op.notLike]: `${nameLowercase}`
                }
            },
            include: {
                model: Category,
                as: 'Categories'
            },
            attributes: ['name', 'id', 'click']
        });

        const refHighClick = await Restaurant.findAll({
            orderBy: ['click', 'DESC'],
            limit: 1
        })

        let resultArr = []

        for (i = 0; i < allRestaurants.length; i++) {
            let currentRestaurant = allRestaurants[i]

            const refArr = refRestaurant.Categories
            let comArr = currentRestaurant.Categories

            const highClick = refHighClick.click
            let currentClick = currentRestaurant.click

            let score = totalScore(refArr, comArr, highClick, currentClick)

            const { click, name, id } = currentRestaurant

            listRestaurant = {
                Score: score,
                name,
                id,
                click,
            }

            resultArr.push(listRestaurant)
        }

        const result = resultArr.slice(0, 10).sort((a, b) => {
            return b.Score - a.Score
        })

        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

exports.map = async (req, res, next) => {
    try {
        const { ne, sw, center } = req.body

        const maxLat = ne.lat
        const minLat = sw.lat

        const maxLng = ne.lng
        const minLng = sw.lng

        const foundRestaurants = await Restaurant.findAll({
            where: {
                latitude: {
                    [Op.between]: [maxLat, minLat]
                },
                longitude: {
                    [Op.between]: [maxLng, minLng]
                },
                isDraft: false,
                include: [
                    {
                        model: Menu,
                        as: "Menus"
                    }
                ]
            }
        });

        let mapList = []

        for (let i = 0; i < foundRestaurants.length; i++) {
            let lngDistance = foundRestaurants[i].lng
            let latDistance = foundRestaurants[i].lat

            let distance = distanceCalc(center, latDistance, lngDistance)

            let {
                name,
                longitude,
                latitude,
                googleId,
                number,
                lineId,
                address,
                isOfficial,
                Menus
            } = foundRestaurants[i]

            let listRestaurant = {
                distance,
                name,
                longitude,
                latitude,
                googleId,
                number,
                lineId,
                address,
                isOfficial,
                Menus
            }

            mapList.push(listRestaurant)
        }

        const result = mapList.sort((a, b) => {
            return a.distance - b.distance
        })

        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}