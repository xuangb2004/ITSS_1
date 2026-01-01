var express = require('express')
var sql = require('mysql')

var app = express();
app.use(express.json);

let con = sql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'holmes&warren1A',
    database : 'elearning_platform',
    port : '3306'
});

con.connect((err) => {
    if(err) throw err;
    else{
        console.log('connected');
    }
})

app.post('/add_cart',(res,req) => {
    const user_id = req.body.user_id;
    const course_id = req.body.course_id;
    var query = 'insert into elearning_plarform.cart (user_id,course_id) values( ?,?)';
    con.query(query,[user_id,course_id],(err,result) => {
        if(err) console.log("error");
        else{
            console.log("success");
            res.send('POSTED');
        }
    })
})

app.post('/update_cart',(res,req) => {
    const user_id = req.body.user_id;
    const course_id = req.body.course_id;
    var query = 'delete from elearning_platform.cart  where user_id = (?) and course_id = (?)';
    con.query(query,[user_id,course_id],(err,result) => {
        if(err) console.log("error");
        else{
            console.log("success");
            res.send('POSTED');
        }
    })
})


app.listen(3000,(err) => {
    if(err) console.log(err);
    else{
        console.log('success');
    }
})

