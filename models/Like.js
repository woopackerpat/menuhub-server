const sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {

    const Like = sequelize.define(
        'Like', {

    }, {
        underscored: true,
        timestamps: false
    }
    )

    Like.associate = models => {

        Like.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                allowNull: false
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        })
        Like.belongsTo(models.Restaurant, {
            foreignKey: {
                name: 'restaurantId',
                allowNull: false
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        })
    }
    
    return Like
}