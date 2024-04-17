const { DataTypes } = require('sequelize');
const sequelize = require('../config');


const EnrIncentiveFile = sequelize.define('EnrIncentiveFile', {
    email: { type: DataTypes.STRING, allowNull: true },
    contactNumber: { type: DataTypes.STRING, allowNull: true },
    amount: { type: DataTypes.STRING },
    totalAmount: { type: DataTypes.INTEGER, allowNull: true },
    transactionID: { type: DataTypes.STRING, allowNull: true },
    paymentOption: { type: DataTypes.STRING },
    paymentType: { type: DataTypes.STRING },
    date1: { type: DataTypes.DATE },
    date2: { type: DataTypes.DATE },
    date3: { type: DataTypes.DATE },
    date4: { type: DataTypes.DATE },
    date5: { type: DataTypes.DATE },
    date6: { type: DataTypes.DATE },
    date7: { type: DataTypes.DATE },
    date8: { type: DataTypes.DATE },
    date9: { type: DataTypes.DATE },
    date10: { type: DataTypes.DATE },
    date11: { type: DataTypes.DATE },
    date12: { type: DataTypes.DATE },
    status: { type: DataTypes.STRING },
});


module.exports = EnrIncentiveFile;