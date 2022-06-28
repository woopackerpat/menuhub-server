const { Restaurant, Menu, User, Comment } = require('../models');
const createError = require('../utils/createError');

exports.addComment = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { text, menuId } = req.body

        await Comment.create({
            userId,
            menuId,
            text
        });

        const updatedComments = await Comment.findAll({
            where: {
                menuId
            },
            include: {
                model: User,
                attributes: ['firstName', 'lastName', 'id']
            }
        });

        res.status(201).json(updatedComments)
    } catch (err) {
        next(err)
    }
}

exports.deleteComment = async (req, res, next) => {
    try {
        const userId = req.user.id
        const {commentId} = req.body

        const commentToDelete = await Comment.findOne({
            where: {
                id: commentId,
                userId
            }
        });

        await commentToDelete.destroy()

        res.status(204).json();
    } catch (err) {
        next(err)
    }
}

exports.updateComment = async (req, res, next) => {
    try {
        const userId = req.user.id
        const {commentId, text} = req.body

        if (!text) {
            createError('A comment cannot be empty', 400)
        }
        
        const commentToUpdate = await Comment.findOne({
            where: {
                id: commentId,
                userId
            }
        });

        commentToUpdate.text = text

        const updatedComment = await commentToUpdate.save();

        res.status(201).json(updatedComment)
    } catch (err) {
        next(err)
    }
}