const dbConnection = require('./db-connection');

const solved = JSON.stringify({solved:[]})
const solver = JSON.stringify({solver:[]})

dbConnection.execute('update users set solved = ? where id = 1', [solved])
dbConnection.execute('update challenges set solver = ? where id = 1', [solver])