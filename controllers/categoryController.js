const createError = require("../utils/createError");
const { Category, Restaurant } = require('../models')

exports.createCategory = async (req, res, next) => {
    try {

        const { categoryArr } = req.body;
        const categoryLength = categoryArr.length

        let result = []

        for (let i = 0; i < categoryLength; i++) {

            const isCatDupe = await Category.findOne({
                where: {
                    name: categoryArr[i]
                }
            })

            if (!isCatDupe) {
                await Category.create({
                    name: categoryArr[i]
                })
            }

            if (isCatDupe) {
                result.push(categoryArr[i])
            }
        }

        const allCategories = await Category.findAll({})

        res.status(201).json({ 'Categories': allCategories, 'Duplicates': result })
    } catch (err) {
        next(err)
    }
}

exports.destroyCategory = async (req, res, next) => {
    try {
        const {categoryArr} = req.body
        const catLength = categoryArr.length
        let result = []

        for (let i=0 ; i < catLength ; i++) {
            const catExist = await Category.findOne({
                where: {
                    name: categoryArr[i]
                }
            });

            if (catExist) {
                await catExist.destroy()
            }

            if (!catExist) {
                result.push(categoryArr[i])
            }
        }

        const allCategories = await Category.findAll({})

        res.status(200).json({ 'Categories': allCategories, 'These do not exist': result})
    } catch (err) {
        next(err)
    }
}

exports.getCategories = async (req, res, next) => {
    try {
        const allCategories = await Category.findAll({})

        res.status(200).json(allCategories)
    } catch(err){
        next(err)
    }
}