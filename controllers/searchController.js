const { Op } = require('sequelize/types');
const { Restaurant, Menu, User } = require('../models');
const createError = require('../utils/createError');

exports.search = async (req, res, next) => {
    try {
        const search = req.params.search

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