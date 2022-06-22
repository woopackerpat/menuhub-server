module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    'Comment',
    {
      text: {
        type: DataTypes.STRING,
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

  Comment.associate = models => {
    Comment.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    Comment.belongsTo(models.Menu, {
      foreignKey: {
        name: 'menuId',
        allowNull: false,
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Comment;
};
