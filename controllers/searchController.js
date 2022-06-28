const { Op } = require('sequelize');
const { Restaurant, Menu, User, Category } = require('../models');
const createError = require('../utils/createError');
const { getDistance } = require('geolib')

const totalScore = (refArr, comArr, currentClick) => {
    const matchArr = refArr.filter(category => comArr.includes(category))
    const matchScore = matchArr.length * 30

    const clickScore = currentClick * 0.5
    return matchScore + clickScore
}

// const distanceCalc = (center, lat, lng) => {
//     latCenter = center.lat
//     lngCenter = center.lng
//     console.log(center.lat)
//     const distance = getDistance(
//         { latitude: latCenter, longitude: lngCenter },
//         { latitude: lat, longitude: lngCenter }
//     )
//     return distance
// }
const distanceCalc = (center, lat, lng) => {
    latCenter = center.lat
    lngCenter = center.lng 

    const lat1 = latCenter
    const lat2 = lat
    const lon1 = lngCenter
    const lon2 = lng

    const R = 6371;
    const dLat = ((lat2 - lat1)*1) * Math.PI / 180;
    const dLon = ((lon2 - lon1)*1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d*1000);
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
            },
            include: [
                {
                    model: Menu,
                    as: "Menus"
                },
                {
                    model: User
                }
            ]
        });

        const maxDistance = distanceCalc(center, maxLat, minLng)

        let mapList = []

        for (let i = 0; i < foundRestaurants.length; i++) {
            let lngDistance = foundRestaurants[i].longitude
            let latDistance = foundRestaurants[i].latitude

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

            if (distance < maxDistance) {
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

        }

        const result = mapList.sort((a, b) => {
            return a.distance - b.distance
        })

        res.status(200).json(result)

    } catch (err) {
        next(err)
    }
}