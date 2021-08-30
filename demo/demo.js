const conn = require("nodejs-mysql-plus")
const c = new conn({
	host: 'xxxx',
	user: 'xxx',
	password: 'xx',
	database: 'xx',
	port: 3306,
	charset: "utf8mb4",
	timezone: 'Asia/Shanghai'
});

const techer = c.table("techer")
techer.getAllByWhere({name:'peter'},function(rows){
    console.log(rows)
})
techer.getColumnsByWhere(['name','sex'],{name:'peter'},function(rows){
	
})