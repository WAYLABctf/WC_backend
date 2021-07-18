const mysql = require('mysql2');

const dbConnection = mysql.createPool({
    host: 'DELETE',
    user: 'DELETE',
    password: 'DELETE',
    database: 'DELETE'
});

module.exports = dbConnection.promise();
