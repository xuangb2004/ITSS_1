let mysql = require('mysql2');

let con = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'holmes&warren1A',
    database : 'elearning_platform',
    port : '3306'
});

con.connect(function(err){
    if(err) throw err;
    console.log("connected!");
    let SQL = "delete from elearning_platform.cart  where user_id = 1 and course_id = 1"
    con.query(SQL,function(err,result){
        if(err) throw err;
        console.log("1 record inserted!");
    });
}

);

