const { error } = require('console')
var express = require('express')
var sql = require('mysql')

var app = express()
app.use(express.json)

var con = sql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'holmes&warren1A',
    database : 'elearning_platform',
    port : '3306'
})

con.connect((err) => {
    if(err) throw error
    else{
        console.log('connected')
    }
})

app.post('/add_whislist',(res,req) => {
    const user_id = req.body.user_id;
    const course_id = req.body.course_id;
    var query = 'insert into elearning_platform.whislist (user_id,course_id) values (?,?)';
    con.query(query,[user_id,course_id],(err,result) => {
        if(err) console.log('error')
        else{
            console.log('success')
            res.setEncoding('POSTED')
        }
    });
})

app.listen(3000,(err) => {
    if(err) console.log("error")
    else{
        console.log('success')
    }
})