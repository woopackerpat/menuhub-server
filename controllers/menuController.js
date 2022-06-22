const { Restaurant, Menu } = require('../models')
const createError = require('../utils/createError')

exports.createMenu = async (req, res, next) => {
    try {
        const restaurantId = req.params.restaurantid
        const { title, imageUrl, description, orderNumber } = req.body

        // Validation
        if (!title) {
            createError('Requires a Title', 400)
        }
        if (!imageUrl) {
            createError('Requires an Image', 400)
        }
        if (!description) {
            createError('Requires a Description', 400)
        }
        if (!orderNumber) {
            createError('Requires an Order Number', 400)
        }
        if (!restaurantId) {
            createError('Requires a Restaurant ID', 400)
        }

        const newMenu = await Menu.create({
            restaurantId,
            title,
            imageUrl,
            description,
            orderNumber,
            include: {
                model: Restaurant,
                attributes: ["name"]
            }
        });

        res.status(201).json({ newMenu });
    } catch (err) {
        next(err)
    }
}

exports.updateMenu = async (req, res, next) => {
    try {
        
        const menuId = req.params.menuid

        const { title, imageUrl, description, orderNumber } = req.body

        const toUpdateMenu = await Menu.findOne({
            where: {
                id: menuId
            },
            include: {
                model: Restaurant,
                attributes: ["name"]
            }
        });

        if (title) {
            toUpdateMenu.title = title
        } if (imageUrl) {
            toUpdateMenu.imageUrl = imageUrl
        } if (description) {
            toUpdateMenu.description = description
        } if (orderNumber) {
            toUpdateMenu.orderNumber = orderNumber
        }
        
        const updatedMenu = await toUpdateMenu.save()
        
        res.status(201).json({ updatedMenu, message: "Up to Date" });
    } catch (err) {
        next(err)
    }
    
}