module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define(
    'Menu',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      orderNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      underscored: true,
      timestamps: true,
    }
  );

  Menu.associate = models => {
    Menu.belongsTo(models.Restaurant, {
      foreignKey: {
        name: 'restaurantId',
        allowNull: false,
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Menu.hasMany(models.Comment, {
      foreignKey: {
        name: 'menuId',
        allowNull: false,
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Menu;
};
