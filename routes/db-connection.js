const mysql = require('mysql2');

const dbConnection = mysql.createPool({
    host: '141.164.47.126',
    user: 'root',
    password: 'waylab',
    database: 'waylab'
});

module.exports = dbConnection.promise();