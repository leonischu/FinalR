'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('decorators', 'image', {
      type: Sequelize.STRING(512),
      allowNull: true,
      after: 'business_name'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('decorators', 'image');
  }
}; 