const sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {

    const Pin = sequelize.define(
        'Pin', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        underscored: true,
        timestamps: true
    }
    )

    Pin.associate = models => {
        Pin.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                allowNull: false
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        })

        Pin.belongsToMany(models.Restaurant, {through: "Pin_Restaurant",})


    }

    return Pin
}