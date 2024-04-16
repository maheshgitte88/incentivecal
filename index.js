const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const sequelize = require('./config');
const Transaction = require('./model/Transaction');
const Incentive = require('./model/Incentive')
const app = express();
const port = 1100;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

(async () => {
    try {
        await sequelize.sync();
        console.log('Table created successfully.');
    } catch (error) {
        console.error('Error creating table:', error);
    }
})();



app.post('/transaction/upload', upload.single('excelFile'), async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);

        const worksheet = workbook.getWorksheet(1);

        if (worksheet) {
            const dataToSave = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) { // Skip the header row
                    const rowData = {
                        id: row.getCell(1).value,
                        memberID: row.getCell(2).value,
                        ERPLeadID: row.getCell(3).value,
                        Name: row.getCell(4).value,
                        Mobile_no: row.getCell(5).value,
                        email: row.getCell(6).value,
                        courseid: row.getCell(7).value,
                        SpecializationID: row.getCell(8).value,
                        FeeHeadID: row.getCell(9).value,
                        fees_type: row.getCell(10).value,
                        ins_1_amt: row.getCell(11).value,
                        ins_2_amt: row.getCell(12).value,
                        ins_3_amt: row.getCell(13).value,
                        ins_1_date: row.getCell(14).value,
                        ins_2_date: row.getCell(15).value,
                        ins_3_date: row.getCell(16).value,
                        ClearedDate: row.getCell(17).value,
                        pay_type: row.getCell(18).value,
                        payment_source: row.getCell(19).value,
                        PayerBankID: row.getCell(20).value,
                        transaction_id: row.getCell(21).value,
                        order_id: row.getCell(22).value,
                        UTR_number: row.getCell(23).value,
                        payment_verification: row.getCell(24).value,
                        PayeeInstituteID: row.getCell(25).value,
                        PayeeBankID: row.getCell(26).value,
                        PayeeACNo: row.getCell(27).value,
                        PayeeACName: row.getCell(28).value,
                        PayeeBranch: row.getCell(29).value,
                        PayeeBankAddress: row.getCell(30).value,
                        PayeeIFSCCode: row.getCell(31).value,
                        UserId: row.getCell(32).value,
                        CurrencyID: row.getCell(33).value,
                        S_Flag: row.getCell(34).value,
                        response: row.getCell(35).value,
                        F_Flag: row.getCell(36).value,
                        loanStatus: row.getCell(37).value,
                        LoanProvider: row.getCell(38).value,
                        API_DT: row.getCell(39).value,
                    };

                    dataToSave.push(rowData);
                }
            });

            // Use Promise.all to wait for all the bulkCreates to complete
            await Promise.all(dataToSave.map(async (rowData) => {
                if (rowData.id) {
                    // Find or create a record with the specified ID
                    const [record, created] = await Transaction.findOrCreate({
                        where: { id: rowData.id },
                        defaults: rowData,
                    });

                    if (!created) {
                        // Update the values if the record already exists
                        await record.update({
                            // Update fields as needed
                        });
                    }
                }
            }));

            console.log('Data saved to the database.');
            res.json({ message: 'Excel file uploaded and data saved to the database.' });
        } else {
            res.status(400).json({ error: 'No valid worksheet found in the Excel file.' });
        }
    } catch (err) {
        console.error('Error saving data to the database:', err);
        res.status(500).json({ error: err.message });
    }
});


app.post('/saveIncentive', async (req, res) => {
    try {
        // Fetch all transactions from the Transaction model
        const transactions = await Transaction.findAll();

        // Group transactions by email or Mobile_no
        const groupedTransactions = groupTransactions(transactions);

        // Process each group of transactions and save them into the Incentive model
        await Promise.all(Object.values(groupedTransactions).map(async (transactionGroup) => {
            const {
                email,
                Mobile_no
            } = transactionGroup[0].toJSON(); // Use the first transaction in the group to extract email and Mobile_no

            console.log("Email:", email);
            console.log("Mobile_no:", Mobile_no);

            // Calculate total amount for the transaction group
            let totalAmount = 0;
            let amount = []; // Array to store individual amounts
            let paymentSources = []; // Array to store individual payment sources
            let paymentType = [];
            transactionGroup.forEach((transaction) => {
                totalAmount += transaction.ins_1_amt;
                amount.push(transaction.ins_1_amt);
                paymentSources.push(transaction.payment_source);
                paymentType.push(transaction.fees_type);

            });

            // Determine status based on whether email or Mobile_no matches
            let status = "";
            if (email && Mobile_no) {
                status = "MatchEmailAndMobile";
            } else if (email) {
                status = "MatchEmail";
            } else {
                status = "MatchMobile";
            }

            // Create or update the record in the Incentive model
            await Incentive.upsert({
                email: email ? email.trim().toLowerCase() : null,
                contactNumber: Mobile_no ? Mobile_no.toString().trim() : null,
                amount, // Join individual amounts with '+'
                totalAmount,
                transactionID: transactionGroup.map(transaction => transaction.transaction_id).join('/'),
                paymentOption: paymentSources.join('/'), // Join individual payment sources with '+'
                paymentType: paymentType.join('/'), // Assuming fees_type is the same for all transactions in the group
                date1: transactionGroup[0].ins_1_date, // Assuming ins_1_date is the same for all transactions in the group
                status
            });
        }));

        res.status(200).json({ message: 'Data saved to the Incentive model.' });
    } catch (error) {
        console.error('Error saving data to Incentive model:', error);
        res.status(500).json({ error: 'Failed to save data to the Incentive model.' });
    }
});

// Function to group transactions by email or Mobile_no
function groupTransactions(transactions) {
    const groupedTransactions = {};
    transactions.forEach(transaction => {
        const key = transaction.email || transaction.Mobile_no;
        if (!groupedTransactions[key]) {
            groupedTransactions[key] = [];
        }
        groupedTransactions[key].push(transaction);
    });
    return groupedTransactions;
}





// app.post('/saveIncentive', async (req, res) => {
//     try {
//         // Fetch all transactions from the Transaction model
//         const transactions = await Transaction.findAll();

//         // Group transactions by email or Mobile_no
//         const groupedTransactions = groupTransactions(transactions);

//         // Process each group of transactions and save them into the Incentive model
//         await Promise.all(Object.values(groupedTransactions).map(async (transactionGroup) => {
//             const {
//                 email,
//                 Mobile_no
//             } = transactionGroup[0].toJSON(); // Use the first transaction in the group to extract email and Mobile_no

//             console.log("Email:", email);
//             console.log("Mobile_no:", Mobile_no);

//             // Calculate total amount for the transaction group
//             let totalAmount = 0;
//             let amount = "";
//             let paymentType=""
//              transactionGroup.forEach((transaction) => {
//                 totalAmount += transaction.ins_1_amt;
//                 amount = transaction.ins_1_amt + "+" + ins_1_amt;
//                 paymentType=transaction.paymentType + "/"
//             });

//             // Determine status based on whether email or Mobile_no matches
//             let status = "";
//             if (email && Mobile_no) {
//                 status = "MatchEmailAndMobile";
//             } else if (email) {
//                 status = "MatchEmail";
//             } else {
//                 status = "MatchMobile";
//             }

//             // Create or update the record in the Incentive model
//             await Incentive.upsert({
//                 email: email ? email.trim().toLowerCase() : null,
//                 contactNumber: Mobile_no ? Mobile_no.toString().trim() : null,
//                 amount: transactionGroup.map(transaction => transaction.ins_1_amt).join('+'),
//                 totalAmount,
//                 transactionID: transactionGroup.map(transaction => transaction.transaction_id).join('/'),
//                 paymentOption: transactionGroup[0].payment_source, // Assuming payment_source is the same for all transactions in the group
//                 paymentType: transactionGroup[0].fees_type, // Assuming fees_type is the same for all transactions in the group
//                 date1: transactionGroup[0].ins_1_date, // Assuming ins_1_date is the same for all transactions in the group
//                 status
//             });
//         }));

//         res.status(200).json({ message: 'Data saved to the Incentive model.' });
//     } catch (error) {
//         console.error('Error saving data to Incentive model:', error);
//         res.status(500).json({ error: 'Failed to save data to the Incentive model.' });
//     }
// });

// // Function to group transactions by email or Mobile_no
// function groupTransactions(transactions) {
//     const groupedTransactions = {};
//     transactions.forEach(transaction => {
//         const key = transaction.email || transaction.Mobile_no;
//         if (!groupedTransactions[key]) {
//             groupedTransactions[key] = [];
//         }
//         groupedTransactions[key].push(transaction);
//     });
//     return groupedTransactions;
// }




// app.post('/saveIncentive', async (req, res) => {
//     try {
//         // Fetch all transactions from the Transaction model
//         const transactions = await Transaction.findAll();

//         // Process each transaction and save it into the Incentive model
//         await Promise.all(transactions.map(async (transaction) => {
//             const {
//                 email,
//                 Mobile_no,
//                 ins_1_amt,
//                 transaction_id,
//                 payment_source,
//                 fees_type,
//                 ins_1_date
//             } = transaction.toJSON();

//             console.log("Email:", email);
//             console.log("Mobile_no:", Mobile_no);

//             // Check if the email or Mobile_no already exists in the Incentive model
//             // Check if the email or Mobile_no already exists in the Incentive model
//             // Normalize email and mobile number strings
//             const normalizedEmail = email ? email.trim().toLowerCase() : null;
//             const normalizedMobileNumber = Mobile_no ? Mobile_no.toString().trim() : null;

//             // Check if the email or Mobile_no already exists in the Incentive model
//             // Remove leading and trailing single quotes from the normalizedEmail
//             // Remove leading and trailing single quotes from the normalizedEmail
//             const normalizedEmailWithoutQuotes = normalizedEmail ? normalizedEmail.replace(/^'|'$/g, '') : null;

//             // Check if the email or Mobile_no already exists in the Incentive model
//             const existingIncentive = await Incentive.findOne({
//                 where: {
//                     $or: [
//                         { email: normalizedEmailWithoutQuotes || null },
//                         { contactNumber: normalizedMobileNumber || null }
//                     ]
//                 }
//             });


//             console.log("Existing Incentive:", existingIncentive);

//             let amount = "";
//             let totalAmount = 0;

//             // If an existing incentive is found, update the amount and totalAmount
//             if (existingIncentive) {
//                 amount = existingIncentive.amount + "+" + ins_1_amt;
//                 totalAmount = existingIncentive.totalAmount + ins_1_amt;
//             } else {
//                 // If no existing incentive is found, initialize amount and totalAmount
//                 amount = ins_1_amt.toString();
//                 totalAmount = ins_1_amt;
//             }

//             // Determine status based on whether email or Mobile_no matches
//             let status = "";
//             if (existingIncentive) {
//                 status = "MatchEmailOrMobile";
//             } else {
//                 status = normalizedEmail ? "MatchEmail" : "MatchMobile";
//             }

//             // Create or update the record in the Incentive model
//             await Incentive.upsert({
//                 email: normalizedEmail,
//                 contactNumber: Mobile_no.toString(), // Ensure contactNumber is a string
//                 amount,
//                 totalAmount,
//                 transactionID: transaction_id,
//                 paymentOption: payment_source,
//                 paymentType: fees_type,
//                 date1: ins_1_date,
//                 status
//             });
//         }));

//         res.status(200).json({ message: 'Data saved to the Incentive model.' });
//     } catch (error) {
//         console.error('Error saving data to Incentive model:', error);
//         res.status(500).json({ error: 'Failed to save data to the Incentive model.' });
//     }
// });












app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});