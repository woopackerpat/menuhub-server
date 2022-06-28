const { Restaurant, Menu, User, Like } = require('../models');
const createError = require('../utils/createError');

exports.cycleLike = async (req, res, next) => {
    try {
        const userId = req.user.id
        const restaurantId = req.params.restaurantid

        const foundLike = await Like.findOne({
            where: {
                userId,
                restaurantId
            }
        });

        if (!foundLike) {
            await Like.create({
                userId,
                restaurantId
            })
            res.status(200).json({"Message": "Liked", Like: true})
        }

        if (foundLike) {
            await foundLike.destroy()
            res.status(200).json({"Message": "Like deleted", Like: false})
        }
    } catch (err) {
        next(err)
    }
}