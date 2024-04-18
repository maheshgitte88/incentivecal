const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const sequelize = require('./config');
const Transaction = require('./model/Transaction');
const Incentive = require('./model/Incentive');
const Enr = require('./model/Enr');
const EnrIncentiveFile = require('./model/EnrIncentiveFile');
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

app.post('/enr-details/upload', upload.single('excelFile'), async (req, res) => {
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
                        Email: row.getCell(1).value,
                        Contact_No: row.getCell(2).value,
                        // Month: row.getCell(3).value
                    };

                    dataToSave.push(rowData);
                }
            });

            // Use Promise.all to wait for all the bulkCreates to complete
            await Promise.all(dataToSave.map(async (rowData) => {
                // Find or create a record with the specified email and contact number
                const [record, created] = await Enr.findOrCreate({
                    where: {
                        Email: rowData.Email,
                        Contact_No: rowData.Contact_No
                    },
                    defaults: { Month: rowData.Month },
                });

                if (!created) {
                    // Update the month if the record already exists
                    await record.update({ Month: rowData.Month });
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
//             let amount = ""; // String to store individual amounts
//             let paymentSources = []; // Array to store individual payment sources
//             let paymentType = []; // Array to store individual payment types
//             transactionGroup.forEach((transaction) => {
//                 totalAmount += transaction.ins_1_amt;
//                 amount += transaction.ins_1_amt.toString() + "+"; // Concatenate amount entries with '+'
//                 paymentSources.push(transaction.payment_source);
//                 paymentType.push(transaction.fees_type);
//             });

//             amount = amount.slice(0, -1);
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
//                 amount, // Join individual amounts with '+'
//                 totalAmount,
//                 transactionID: transactionGroup.map(transaction => transaction.transaction_id).join('/'),
//                 paymentOption: paymentSources.join('/'), // Join individual payment sources with '+'
//                 paymentType: paymentType.join('/'), // Assuming fees_type is the same for all transactions in the group
//                 date1: transactionGroup[0].ins_1_date, // Assuming ins_1_date is the same for all transactions in the group
//                 // date2: transactionGroup[0].ins_1_date,
//                 // date3: transactionGroup[0].ins_1_date,
//                 // date4: transactionGroup[0].ins_1_date,
//                 // date5: transactionGroup[0].ins_1_date,
//                 status
//             });
//         }));

//         res.status(200).json({ message: 'Data saved to the Incentive model.' });
//         MatchRecord();
//     } catch (error) {
//         console.error('Error saving data to Incentive model:', error);
//         res.status(500).json({ error: 'Failed to save data to the Incentive model.' });
//     }
// });


async function MatchRecord() {
    try {
        // Fetch all records from Incentive model
        const incentives = await Incentive.findAll();

        // Map Incentive records by email and contactNumber for fast lookup
        const incentiveByEmail = new Map();
        const incentiveByContactNumber = new Map();

        incentives.forEach(incentive => {
            if (incentive.email) {
                incentiveByEmail.set(incentive.email.toLowerCase(), incentive);
            }
            if (incentive.contactNumber) {
                incentiveByContactNumber.set(incentive.contactNumber, incentive);
            }
        });

        // Fetch all records from Enr model
        const enrRecords = await Enr.findAll();

        // Match records based on email and contact number
        const matchedRecords = [];
        const notMatchedRecords = [];

        for (const enrRecord of enrRecords) {
            const emailKey = enrRecord.Email.toLowerCase();
            const contactNumberKey = enrRecord.Contact_No;

            // Check if there is a matching record in Incentive model
            if (incentiveByEmail.has(emailKey) || incentiveByContactNumber.has(contactNumberKey)) {
                const matchingIncentive = incentiveByEmail.get(emailKey) || incentiveByContactNumber.get(contactNumberKey);
                matchedRecords.push({
                    email: enrRecord.Email,
                    contactNumber: enrRecord.Contact_No,
                    amount: matchingIncentive.amount,
                    totalAmount: matchingIncentive.totalAmount,
                    transactionID: matchingIncentive.transactionID,
                    paymentOption: matchingIncentive.paymentOption,
                    paymentType: matchingIncentive.paymentType,
                    date1: matchingIncentive.date1,
                    date2: matchingIncentive.date2,
                    date3: matchingIncentive.date3,
                    date4: matchingIncentive.date4,
                    date5: matchingIncentive.date5,
                    date6: matchingIncentive.date6,
                    date7: matchingIncentive.date7,
                    date8: matchingIncentive.date8,
                    date9: matchingIncentive.date9,
                    date10: matchingIncentive.date10,
                    date11: matchingIncentive.date11,
                    date12: matchingIncentive.date12,
                    status: 'Matched',
                    month: enrRecord.Month
                });
            } else {
                notMatchedRecords.push({
                    email: enrRecord.Email,
                    contactNumber: enrRecord.Contact_No,
                    amount: null,
                    totalAmount: null,
                    transactionID: null,
                    paymentOption: null,
                    paymentType: null,
                    date1: null,
                    date2: null,
                    date3: null,
                    date4: null,
                    date5: null,
                    date6: null,
                    date7: null,
                    date8: null,
                    date9: null,
                    date10: null,
                    date11: null,
                    date12: null,
                    status: 'NotMatched',
                    month: enrRecord.Month
                });
            }
        }

        // Insert matched and non-matched records into EnrIncentiveFile model
        await Promise.all([
            EnrIncentiveFile.bulkCreate(matchedRecords),
            EnrIncentiveFile.bulkCreate(notMatchedRecords)
        ]);

        // res.json({ message: 'Records matched and inserted into EnrIncentiveFile model.' });
    } catch (error) {
        console.error('Error matching and inserting records:', error);
        // res.status(500).json({ error: 'Failed to match and insert records.' });
    }
}

// app.post('/match-and-insert', async (req, res) => {
//     try {
//         // Fetch all records from Incentive and Enr models
//         const [incentiveRecords, enrRecords] = await Promise.all([
//             Incentive.findAll(),
//             Enr.findAll()
//         ]);

//         // Match records based on email
//         const matchedByEmail = [];
//         const matchedByContactNumber = [];
//         const notMatched = [];

//         for (const incentiveRecord of incentiveRecords) {
//             let matched = false;
//             for (const enrRecord of enrRecords) {
//                 if (incentiveRecord.email === enrRecord.Email) {
//                     matchedByEmail.push({ incentiveRecord, enrRecord });
//                     matched = true;
//                     break;
//                 } else if (incentiveRecord.contactNumber === enrRecord.Contact_No) {
//                     matchedByContactNumber.push({ incentiveRecord, enrRecord });
//                     matched = true;
//                     break;
//                 }
//             }
//             if (!matched) {
//                 notMatched.push(incentiveRecord);
//             }
//         }

//         // Insert matched records into EnrIncentiveFile model
//         await Promise.all([
//             EnrIncentiveFile.bulkCreate(matchedByEmail.map(({ incentiveRecord, enrRecord }) => ({
//                 email: incentiveRecord.email,
//                 contactNumber: incentiveRecord.contactNumber,
//                 amount: incentiveRecord.amount,
//                 totalAmount: incentiveRecord.totalAmount,
//                 transactionID: incentiveRecord.transactionID,
//                 paymentOption: incentiveRecord.paymentOption,
//                 paymentType: incentiveRecord.paymentType,
//                 date1: incentiveRecord.date1,
//                 date2: incentiveRecord.date2,
//                 date3: incentiveRecord.date3,
//                 status: 'MatchedByEmail',
//                 month: enrRecord.Month
//             }))),
//             EnrIncentiveFile.bulkCreate(matchedByContactNumber.map(({ incentiveRecord, enrRecord }) => ({
//                 email: incentiveRecord.email,
//                 contactNumber: incentiveRecord.contactNumber,
//                 amount: incentiveRecord.amount,
//                 totalAmount: incentiveRecord.totalAmount,
//                 transactionID: incentiveRecord.transactionID,
//                 paymentOption: incentiveRecord.paymentOption,
//                 paymentType: incentiveRecord.paymentType,
//                 date1: incentiveRecord.date1,
//                 date2: incentiveRecord.date2,
//                 date3: incentiveRecord.date3,
//                 status: 'MatchedByContactNumber',
//                 month: enrRecord.Month
//             }))),
//             EnrIncentiveFile.bulkCreate(notMatched.map((record) => ({
//                 email: record.email,
//                 contactNumber: record.contactNumber,
//                 amount: record.amount,
//                 totalAmount: record.totalAmount,
//                 transactionID: record.transactionID,
//                 paymentOption: record.paymentOption,
//                 paymentType: record.paymentType,
//                 date1: record.date1,
//                 date2: record.date2,
//                 date3: record.date3,
//                 status: 'NotMatched'
//             })))
//         ]);

//         res.json({ message: 'Records matched and inserted into EnrIncentiveFile model.' });
//     } catch (error) {
//         console.error('Error matching and inserting records:', error);
//         res.status(500).json({ error: 'Failed to match and insert records.' });
//     }
// });




// app.post('/match-and-insert', async (req, res) => {
//     try {
//         // Fetch all records from Incentive model
//         const incentives = await Incentive.findAll();

//         // Map Incentive records by email and contactNumber for fast lookup
//         const incentiveByEmail = new Map();
//         const incentiveByContactNumber = new Map();

//         incentives.forEach(incentive => {
//             if (incentive.email) {
//                 incentiveByEmail.set(incentive.email.toLowerCase(), incentive);
//             }
//             if (incentive.contactNumber) {
//                 incentiveByContactNumber.set(incentive.contactNumber, incentive);
//             }
//         });

//         // Fetch all records from Enr model
//         const enrRecords = await Enr.findAll();

//         // Match records based on email and contact number
//         const matchedRecords = [];
//         const notMatchedRecords = [];

//         for (const enrRecord of enrRecords) {
//             const emailKey = enrRecord.Email.toLowerCase();
//             const contactNumberKey = enrRecord.Contact_No;

//             // Check if there is a matching record in Incentive model
//             if (incentiveByEmail.has(emailKey) || incentiveByContactNumber.has(contactNumberKey)) {
//                 const matchingIncentive = incentiveByEmail.get(emailKey) || incentiveByContactNumber.get(contactNumberKey);
//                 matchedRecords.push({
//                     email: enrRecord.Email,
//                     contactNumber: enrRecord.Contact_No,
//                     amount: matchingIncentive.amount,
//                     totalAmount: matchingIncentive.totalAmount,
//                     transactionID: matchingIncentive.transactionID,
//                     paymentOption: matchingIncentive.paymentOption,
//                     paymentType: matchingIncentive.paymentType,
//                     date1: matchingIncentive.date1,
//                     date2: matchingIncentive.date2,
//                     date3: matchingIncentive.date3,
//                     status: 'Matched',
//                     month: enrRecord.Month
//                 });
//             } else {
//                 notMatchedRecords.push({
//                     email: enrRecord.Email,
//                     contactNumber: enrRecord.Contact_No,
//                     amount: null,
//                     totalAmount: null,
//                     transactionID: null,
//                     paymentOption: null,
//                     paymentType: null,
//                     date1: null,
//                     date2: null,
//                     date3: null,
//                     status: 'NotMatched',
//                     month: enrRecord.Month
//                 });
//             }
//         }

//         // Insert matched and non-matched records into EnrIncentiveFile model
//         await Promise.all([
//             EnrIncentiveFile.bulkCreate(matchedRecords),
//             EnrIncentiveFile.bulkCreate(notMatchedRecords)
//         ]);

//         res.json({ message: 'Records matched and inserted into EnrIncentiveFile model.' });
//     } catch (error) {
//         console.error('Error matching and inserting records:', error);
//         res.status(500).json({ error: 'Failed to match and insert records.' });
//     }
// });

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
            let amount = ""; // String to store individual amounts
            let paymentSources = []; // Array to store individual payment sources
            let paymentType = []; // Array to store individual payment types
            let dates = []; // Array to store all dates

            transactionGroup.forEach((transaction) => {
                totalAmount += transaction.ins_1_amt;
                amount += transaction.ins_1_amt.toString() + "+"; // Concatenate amount entries with '+'
                paymentSources.push(transaction.payment_source);
                paymentType.push(transaction.fees_type);
                dates.push(new Date(transaction.ins_1_date).toISOString().split('T')[0]);  // Store all dates

            });

            amount = amount.slice(0, -1);
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
                paymentType: paymentType.join('/'), // Join individual payment types with '+'
                date1: dates[0], // Use DATE_FORMAT to format the date
                date2: dates[1] || null,
                date3: dates[2] || null,
                date4: dates[3] || null,
                date5: dates[4] || null,
                date6: dates[5] || null,
                date7: dates[6] || null,
                date8: dates[7] || null,
                date9: dates[8] || null,
                date10: dates[9] || null,
                date11: dates[10] || null,
                date12: dates[11] || null,
                status
            });
        }));
        res.status(200).json({ message: 'Data saved to the Incentive File ready to download... on url /download-enr-incentive-file ' });
        MatchRecord();
    } catch (error) {
        console.error('Error saving data to Incentive model:', error);
        res.status(500).json({ error: 'Failed to save data to the Incentive model.' });
    }
});



app.get('/download-enr-incentive-file', async (req, res) => {
    try {
        // Fetch all data from the EnrIncentiveFile model
        const data = await EnrIncentiveFile.findAll();

        // Create a new workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('EnrIncentiveFile Data');

        // Add headers to the worksheet
        worksheet.addRow([
            'Email',
            'Contact Number',
            'Amount',
            'Total Amount',
            'Transaction ID',
            'Payment Option',
            'Payment Type',
            'Date 1',
            'Date 2',
            'Date 3',
            'Date 4',
            'Date 5',
            'Date 6',
            'Date 7',
            'Date 8',
            'Date 9',
            'Date 10',
            'Date 11',
            'Date 12',
            'Status'
        ]);

        // Add data to the worksheet
        data.forEach((row) => {
            worksheet.addRow([
                row.email,
                row.contactNumber,
                row.amount,
                row.totalAmount,
                row.transactionID,
                row.paymentOption,
                row.paymentType,
                row.date1,
                row.date2,
                row.date3,
                row.date4,
                row.date5,
                row.date6,
                row.date7,
                row.date8,
                row.date9,
                row.date10,
                row.date11,
                row.date12,
                row.status
            ]);
        });

        // Set headers to force download the file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        // Set the Content-Disposition header with the file name including the current date
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to month since it's zero-based
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        const fileName = `incentive_file_${formattedDate}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Write the workbook to the response stream
        await workbook.xlsx.write(res);

        // End the response
        res.end();
    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).json({ error: 'Failed to generate Excel file.' });
    }
});


app.delete('/delete-all', async (req, res) => {
    try {
        await Transaction.destroy({
            where: {}, // Empty where clause to delete all records
            truncate: true // Truncate option to reset auto-increment values for MySQL
        });
        await Enr.destroy({
            where: {}, // Empty where clause to delete all records
            truncate: true // Truncate option to reset auto-increment values for MySQL
        });
        await Incentive.destroy({
            where: {}, // Empty where clause to delete all records
            truncate: true // Truncate option to reset auto-increment values for MySQL
        });
        // Delete all data from the EnrIncentiveFile model
        await EnrIncentiveFile.destroy({
            where: {}, // Empty where clause to delete all records
            truncate: true // Truncate option to reset auto-increment values for MySQL
        });

        res.status(200).json({ message: 'All data deleted from database & Ready to next report Genration process...' });
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ error: 'Failed to delete data from EnrIncentiveFile model.' });
    }
});



app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
