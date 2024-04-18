const { DataTypes } = require('sequelize');
const sequelize = require('../config');; // Import your Sequelize instance
const Incentive = sequelize.define('Incentive', {
    email: { type: DataTypes.STRING, allowNull: true },
    contactNumber: { type: DataTypes.STRING, allowNull: true },
    amount: { type: DataTypes.STRING},
    totalAmount: { type: DataTypes.INTEGER, allowNull: true },
    transactionID: { type: DataTypes.STRING, allowNull: true },
    paymentOption: { type: DataTypes.STRING },
    paymentType: { type: DataTypes.STRING },
    date1: { type: DataTypes.STRING },
    date2: { type: DataTypes.STRING },
    date3: { type: DataTypes.STRING },
    date4: { type: DataTypes.STRING },
    date5: { type: DataTypes.STRING },
    date6: { type: DataTypes.STRING },
    date7: { type: DataTypes.STRING },
    date8: { type: DataTypes.STRING },
    date9: { type: DataTypes.STRING },
    date10: { type: DataTypes.STRING },
    date11: { type: DataTypes.STRING },
    date12: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    correctGmail: { type: DataTypes.STRING },
    correctMobile: { type: DataTypes.STRING }
});

module.exports = Incentive;