const { DataTypes } = require('sequelize');
const sequelize = require('../config'); // Import your Sequelize instance

const Enr = sequelize.define('Enr', {
    Email: { type: DataTypes.STRING, allowNull: false },
    Contact_No: { type: DataTypes.STRING, allowNull: false },
    Month: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Enr;
