
module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define(
        'Category', {
            name: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
                validate: {
                    notEmpty: false
                }
            }
        },
        {
            underscored: true,
            timestamps: false
        }
    );
    
    Category.associate = models => {
        Category.belongsToMany(models.Restaurant, { through: 'Category_Restaurant'})
    };

    return Category
}