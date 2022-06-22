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
      longitude: {
        type: DataTypes.STRING,
      },
      latitude: {
        type: DataTypes.STRING,
      },
      googleId: {
        type: DataTypes.STRING,
      },
      isOffical: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      isDraft: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM(
          'Thai',
          'Isan',
          'Japanese',
          'Chinese',
          'European',
          'Italian',
          'Asian',
          'Indian',
          'French',
          'Mexican',
          'Bakery',
          'Breakfast',
          'Noodle',
          'Cafe',
          'Buffet',
          'Moo GaTa',
          'Korean',
          'Other'
        ),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
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
  };

  return Restaurant;
};
