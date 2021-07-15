const dbConnection = require('./db-connection');
const json = require('json')

const solved = JSON.stringify({solved:[]})
const solver = JSON.stringify({solver:[]})


dbConnection.execute('update users set solved = ? where id = 2', [solved])
dbConnection.execute('update challenges set solver = ? where id = 1', [solver])

const test = async function () {
    const [user] = await dbConnection.execute("SELECT * FROM users where username = ?", ['pocas']);
    const J_solved = JSON.parse(user[0].solved)
    console.log(J_solved)
}()