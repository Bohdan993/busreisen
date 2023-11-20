'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('discounts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
        allowNull: false,
      },
      coef: {
        type: Sequelize.FLOAT(3, 2),
        allowNull: false,
      },
      group: {
        type: Sequelize.ENUM(
          'adults',
          'children',
          'both',
          'bus-flights',
          'discount-card'
        ),
        defaultValue: 'adults',
        allowNull: false,
      },
      inactivePeriod: {
        type: Sequelize.STRING(11),
        allowNull: true,
        defaultValue: null,
      },
      maxAge: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      minAge: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 500,
      },
      busFlightId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'busflights', // Make sure to use the actual table name for BusFlightModel
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add any additional logic for associations or indexes here, if needed
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the table if migration needs to be rolled back
    await queryInterface.dropTable('discounts');
  },
};
