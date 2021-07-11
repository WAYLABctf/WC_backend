const mysql = require('mysql2');

const dbConnection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '321919',
    database: 'project'
});

module.exports = dbConnection.promise();
