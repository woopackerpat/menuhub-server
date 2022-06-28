module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define(
    'Restaurant',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: false,
        },
      },
      lowercase: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: false
        }
      },
      longitude: {
        type: DataTypes.DECIMAL(11,8),
      },
      latitude: {
        type: DataTypes.DECIMAL(11,8),
      },
      googleId: {
        type: DataTypes.STRING,
      },
      number: {
        type: DataTypes.INTEGER,
      },
      lineId: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING
      },
      isOfficial: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      isDraft: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      isRequest: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      click: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      underscored: true,
      timestamps: true,
    }
  );

  Restaurant.associate = models => {
    Restaurant.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Restaurant.hasMany(models.Menu, {
      foreignKey: {
        name: 'restaurantId',
        allowNull: false,
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    Restaurant.hasMany(models.Like, {
      foreignKey: {
        name: 'restaurantId',
        allowNull: false,
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Restaurant.belongsToMany(models.Pin, { through: 'Pin_Restaurant' });
    Restaurant.belongsToMany(models.Category, { through: 'Category_Restaurant'});
  };

  return Restaurant;
};
