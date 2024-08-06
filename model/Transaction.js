// Transaction.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config');; // Import your Sequelize instance

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    // memberID: { type: DataTypes.INTEGER },
    // ERPLeadID: { type: DataTypes.INTEGER },
    Name: { type: DataTypes.STRING },
    Mobile_no: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    // courseid: { type: DataTypes.INTEGER },
    // SpecializationID: { type: DataTypes.INTEGER },
    // FeeHeadID: { type: DataTypes.INTEGER },
    fees_type: { type: DataTypes.STRING },
    ins_1_amt: { type: DataTypes.INTEGER },
    // ins_2_amt: { type: DataTypes.INTEGER },
    // ins_3_amt: { type: DataTypes.INTEGER },
    ins_1_date: { type: DataTypes.DATE },
    // ins_2_date: { type: DataTypes.DATE },
    // ins_3_date: { type: DataTypes.DATE },
    // ClearedDate: { type: DataTypes.DATE },
    // pay_type: { type: DataTypes.STRING },
    payment_source: { type: DataTypes.STRING },
    // PayerBankID: { type: DataTypes.INTEGER },
    transaction_id: { type: DataTypes.STRING },
    // order_id: { type: DataTypes.STRING },
    // UTR_number: { type: DataTypes.STRING },
    // payment_verification: { type: DataTypes.STRING },
    // PayeeInstituteID: { type: DataTypes.INTEGER },
    // PayeeBankID: { type: DataTypes.STRING },
    // PayeeACNo: { type: DataTypes.STRING },
    // PayeeACName: { type: DataTypes.STRING },
    // PayeeBranch: { type: DataTypes.STRING },
    // PayeeBankAddress: { type: DataTypes.STRING },
    // PayeeIFSCCode: { type: DataTypes.STRING },
    // UserId: { type: DataTypes.INTEGER },
    // CurrencyID: { type: DataTypes.INTEGER },
    // S_Flag: { type: DataTypes.STRING },
    // response: { type: DataTypes.STRING },
    // F_Flag: { type: DataTypes.STRING },
    // loanStatus: { type: DataTypes.STRING },
    // LoanProvider: { type: DataTypes.STRING },
    // API_DT: { type: DataTypes.DATE }
});

module.exports = Transaction;
