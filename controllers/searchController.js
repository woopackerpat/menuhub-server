const { Op } = require('sequelize');
const { Restaurant, Menu, User, Category, Like } = require('../models');
const createError = require('../utils/createError');
const { getDistance } = require('geolib')

const totalScore = (refArr, comArr, currentClick) => {
    const matchArr = refArr.filter(category => comArr.includes(category))
    const matchScore = matchArr.length * 30

    const clickScore = currentClick * 0.5
    return matchScore + clickScore
}

const distanceCalc = (center, lat, lng) => {
    latCenter = center.lat
    lngCenter = center.lng

    const lat1 = latCenter
    const lat2 = lat
    const lon1 = lngCenter
    const lon2 = lng

    const R = 6371;
    const dLat = ((lat2 - lat1) * 1) * Math.PI / 180;
    const dLon = ((lon2 - lon1) * 1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 1000);
}

exports.search = async (req, res, next) => {
    try {
        const { search } = req.body

        const lowercaseSearch = search.toString().toLowerCase()

        const foundByName = await Restaurant.findAll({
            where: {
                lowercase: {
                    [Op.substring]: `${lowercaseSearch}`
                }
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
        });

        res.status(200).json(foundByName)
    } catch (err) {
        next(err)
    }
}

exports.suggestions = async (req, res, next) => {
    try {
        const { refId } = req.body

        const refRestaurant = await Restaurant.findOne({
            where: {
                id: refId
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
        })

        if (!refRestaurant) {
            createError('This restaurant does not exist', 404)
        }

        const nameLowercase = refRestaurant.name.toString().toLowerCase()

        let allRestaurants = await Restaurant.findAll({
            where: {
                lowercase: {
                    [Op.notLike]: `%${nameLowercase}%`
                }
            },
            include: {
                model: Category,
                as: 'Categories'
            },
            attributes: ['name', 'id', 'click']
        });

        let resultArr = []

        for (i = 0; i < allRestaurants.length; i++) {
            let currentRestaurant = allRestaurants[i]

            const refArr = refRestaurant.Categories
            let comArr = currentRestaurant.Categories

            let currentClick = currentRestaurant.click

            let score = totalScore(refArr, comArr, currentClick)

            const { click, name, id } = currentRestaurant

            listRestaurant = {
                Score: score,
                name,
                id,
                click,
            }

            resultArr.push(listRestaurant)
        }

        const result = resultArr.sort((a, b) => {
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

        const officialRestaurants = await Restaurant.findAll({
            where: {
                latitude: {
                    [Op.and]: {
                        [Op.gt]: minLat,
                        [Op.lt]: maxLat
                    }
                },
                longitude: {
                    [Op.and]: {
                        [Op.gt]: minLng,
                        [Op.lt]: maxLng
                    }
                },
                isDraft: false,
                isOfficial: true
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
        });

        const userRestaurants = await Restaurant.findAll({
            where: {
                latitude: {
                    [Op.and]: {
                        [Op.gt]: minLat,
                        [Op.lt]: maxLat
                    }
                },
                longitude: {
                    [Op.and]: {
                        [Op.gt]: minLng,
                        [Op.lt]: maxLng
                    }
                },
                isDraft: false,
                isOfficial: false
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
        });

        const temp = [...officialRestaurants, ...userRestaurants]
        const filter = []
        const foundRestaurants = temp.filter(restaurant => {
            const isDupe = filter.includes(restaurant.name)
            if (!isDupe) {
                filter.push(restaurant.name)
                return true
            }
            return false
        })

        const maxDistance = distanceCalc(center, maxLat, minLng)

        let mapList = []

        for (let i = 0; i < foundRestaurants.length; i++) {
            let lngDistance = foundRestaurants[i].longitude
            let latDistance = foundRestaurants[i].latitude

            let distance = distanceCalc(center, latDistance, lngDistance)

            let {
                name,
                id,
                longitude,
                latitude,
                googleId,
                number,
                lineId,
                address,
                isOfficial,
                Menus,
                User
            } = foundRestaurants[i]

            if (distance < maxDistance) {
                let listRestaurant = {
                    distance,
                    id,
                    name,
                    longitude,
                    latitude,
                    googleId,
                    number,
                    lineId,
                    address,
                    isOfficial,
                    Menus,
                    User
                }

                mapList.push(listRestaurant)
            }

        }

        const resultArr = mapList.sort((a, b) => {
            let isOfficialA = a.isOfficial
            let isOfficialB = b.isOfficial

            let distanceA = a.distance
            let distanceB = b.distance

            // if (distanceA > distanceB) return 1
            // if (distanceA < distanceB) return -1
            // if (isOfficialA === isOfficialB) {
            //     return 0
            // } else if (isOfficialA) {
            //     return -1
            // } else {
            //     return 1
            // }

            if (isOfficialA && isOfficialB) {
                if (distanceA < distanceB) {
                    return -1
                }
                if (distanceA > distanceB) {
                    return 1
                }
            }
            if (!isOfficialA && !isOfficialB) {
                if (distanceA < distanceB) {
                    return -1
                }
                if (distanceA > distanceB) {
                    return 1
                }
            }
            if (isOfficialA) return -1
            if (!isOfficialA) return 1
        })

        // console.log(foundRestaurants)
        res.status(201).json(resultArr)

    } catch (err) {
        next(err)
    }
}