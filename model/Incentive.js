const { DataTypes } = require('sequelize');
const sequelize = require('../config');; // Import your Sequelize instance
const Incentive = sequelize.define('Incentive', {
    email: { type: DataTypes.STRING, allowNull: true },
    contactNumber: { type: DataTypes.STRING, allowNull: true },
    amount: { type: DataTypes.INTEGER, allowNull: true },
    totalAmount: { type: DataTypes.INTEGER, allowNull: true },
    transactionID: { type: DataTypes.STRING, allowNull: true },
    paymentOption: { type: DataTypes.STRING },
    paymentType: { type: DataTypes.STRING },
    date1: { type: DataTypes.DATE },
    date2: { type: DataTypes.DATE },
    date3: { type: DataTypes.DATE },
    status: { type: DataTypes.STRING },
    correctGmail: { type: DataTypes.STRING },
    correctMobile: { type: DataTypes.STRING }
});

module.exports = Incentive;