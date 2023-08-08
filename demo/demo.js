const Conn = require("../index").Conn
const c = new Conn({
	host: 'xxxxx.com'	 ,
	user: 'xxxx',
	password: 'xxxxx',
	database: 'xxxx',
	port: 3306	,
	charset: 'utf8mb4',
	// timezone: 'Asia/Shanghai',
	time_colum_key: 'create_time', //默认时间字段名
	create_time: 'create_time',
	debug: true, //可选 是否打印sql
	ssl:'../ca-certificate.crt'
})
let t = c.table('reg')
t.getData({
	where:{},
	limit:2
},function(rows){
	console.log(rows)
})