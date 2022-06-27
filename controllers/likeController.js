const { Restaurant, Menu, User, Like } = require('../models');
const createError = require('../utils/createError');

exports.cycleComment = async (req, res, next) => {
    try {
        const userId = req.user.id
        const restaurantId = req.params.restaurantid

        const foundLike = await Like.findOne({
            where: {
                userId,
                restaurantId
            }
        });

        // const foundRestaurant = await Restaurant.findOne({
        //     where: {
        //         id: restaurantId
        //     }
        // });

        if (!foundLike) {
            await Like.create({
                userId,
                restaurantId
            })
            res.status(200).json({"Message": "Liked"})
        }

        if (foundLike) {
            await foundLike.destroy()
            res.status(200).json({"Message": "Like deleted"})
        }
    } catch (err) {
        next(err)
    }
}