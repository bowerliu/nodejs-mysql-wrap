# mysql-simple-wrap
 
# mysql-simple-wrap 是什么?

一个实现了mysql 常用功能的nodejs 库，旨在优雅简单的使用sql语言，即在代码中不出现sql语句

实现了批量插入和批量更新功能，多个项目稳定运行

A mysql nodejs oo wrap, make sql simple to use, idealy no need to write sql language in your code. 

如有问题 欢迎反馈 bower.liu@gmail.com

# mysql-simple-wrap 有什么主要功能？

* 对象化mysql 
* 批量插入insert
* 批量更新
* redis 缓存

# 如何使用
## 安装引用

可以直接下载源码后直接引用也可以npm安装

执行命令：`npm install mysql-simple-wrap`
### 实例化mysql conn
```javascript
const { Conn } = require("mysql-simple-wrap")
const redis = require('redis')

const  cacheRedis = redis.createClient('6379', '127.0.0.1');

const c = new Conn({
	host: '',
	user: '',
	password: '',
	database: '',
	port: 3306, //可选
	charset: "utf8mb4",//可选
	timezone: 'Asia/Shanghai',//可选
    time_colum_key:'create_time',//默认时间字段名
    debug:false, //可选 是否打印sql
    redis:cacheRedis,//redis 实例
	cache_on: true, //缓存开启
	cache_time:60, // 缓存秒数
    redis_key_prefix: "mysql_cache_" //可选 redis key 前缀
});

```
可以实例化多个数据库链接
## 简单来个例子  simple example
```javascript
const teacher = c.table("teacher") //传入表名
teacher.getAllByWhere({name:'peter'},function(rows){
    console.log(rows)
})
//等价于 
c.query('select * from teacher where name = "peter"',function(rows){
    console.log(rows)
})

techer.getColumnsByWhere(['name','sex'],{name:'peter'},function(rows){
	
})
//等价于 
c.query('select name, sex  from teacher where name = "peter"',function(rows){
    console.log(rows)
})
```
getAllByWhere getColumnsByWhere 基本可以满足85%的日常查询了

### 统一查询方法 getData()
```javascript
const teacher = c.table("teacher")
const where = {school:'goodschool'}
const columns = ['name','sex','create_time','class',"school"]
const options = {
    where :where,//对象或数组 [[school:'goodschool']]
    columns :columns,//数组
    limit : 5 ,
    orderby : "create_time desc",
    groupby : "class",
    join_sign : "or", //默认值 and 
    eq_sign : "like", // 默认值 =
    no_cache: true; //默认false 强制不取缓存
    callback :function(rows){
        
    }
}

teacher.getData(options,function(rows){
        
    };) 
//回调函数也可以写到后面 第二个参数， 优先级高
 
```
### 实战 查询 age > 20 and age <= 30  and school is null
```javascript
const where = []
where.push(['age','> 20'])
where.push(['age','<= 30'])
where.push(['school','is not null'])
// where 可以是二维数组形式
teacher.getData({
            where:where
        },function(rows){    
})
//以上等价于
c.query('select* from teacher where age > 20 and age < 30 and school is not null ',function(rows){

})
```
### where 是可以是对象也可以是数组
```javascript
//数组形式
const where = []
where.push(['age','> 20'])
where.push(['school','is not null'])

//等价于以下对象
where = {
    'age':'> 20',
    'school':'is not null'
}
teacher.getData({
            where:where
        },function(rows){    
})

//数组可以解决 对象不能有重复字段的问题
//如：
where.push(['age','> 20'])
where.push(['age','<= 30'])

 
```
## select 链式操作
```javascript
//数组形式
const where = []
where.push(['age','> 20'])
where.push(['school','is not null'])
 
teacher.select().where(where).orderby("create_time").groupby("class").limit(2).exec(rows =>{
    console.log(rows)
})
 //以上等价于
c.query('select* from teacher where age > 20  and school is not null group by class order by create_time limit 2',function(rows){

})
```
### 插入数据 insert  
```javascript
const data ={
    name:"peter",
    age:"001",
    class:"001",
    school:"001",
    create_time:"now()",//插入当前时间 专门用法
}
teacher.insert(data,function(rows){    })

```
### mysql 批量插入数据 insert  batch
```javascript
const data =[
    {name:"peter",
    age:"001",
    class:"001",
    school:"001"},
    {name:"peter002",
    age:"002",
    class:"002",
    school:"002"}
    ]
teacher.insert(data,function(rows){    })

```
传入数组即可 批量插入数据

### mysql update 更新

```javascript
const data ={
    class:"001",
    school:"001",
}
const where = {name:'peter'}
teacher.update(data,where,function(rows){    })
// 等价于
c.query(`update teacher set class = "001" school = "001" where name = "peter"`)
```
update 为写操作 请谨慎 where参数为必填项


### mysql update batch 批量更新
实战：将特定id的数据的class字段更新
```javascript
const data =[
    {class:"001",id:"001"},
    {class:"002",id:"002"},
    {class:"003",id:"003"},
    ]
//更新字段为class  限制字段为 id
const keys = {updatekey:'class', wherekey:'id'}
const where = {age:'> 20'} //附加where 可选
teacher.updateBatch(data,keys,where,function(rows){    })

```
update 为写操作 请谨慎 where参数为必填项


### mysql del 删除
```javascript

const where = {age:'> 20'}  
teacher.del(where,function(rows){    })

```
del 为写操作 请谨慎 where参数为必填项

### mysql query sql执行
直接执行sql
```javascript

const sql = "select * from teacher";
c.query(sql,function(rows){    })

```
 
### mysql redis 缓存
全局配置redis缓存
```javascript

const { Conn } = require("mysql-simple-wrap")
const redis = require('redis')

const  cacheRedis = redis.createClient('6379', '127.0.0.1');

const c = new Conn({
   ...
    redis:cacheRedis,//redis 实例
	cache_on: true, //缓存开启
	cache_time:60, // 缓存秒数
    redis_key_prefix: "mysql_cache_" //可选 redis key 前缀
});
//noCache() 不取缓存
//链式操作
teacher.select().where({'phone':123}).limit(1).noCache().exec(rows =>{
	 console.log(rows)
 
 })
// no_cache  选项 不取缓存

teacher.getData({
    no_cache:true;
    ...
})
```
### mysql redis flush 清除全部缓存
全局配置redis缓存
```javascript
c.flush(function(){
    console.log("clear cache succeed")
}) //清除全部缓存
```
### 快捷方式 getById updateById  countAllByWhere
针对where只有id的情况
```javascript
 
const id = 1
teacher.getById(id,function(rows){    })
teacher.updateById(data,id,function(rows){})
teacher.countAllByWhere(where,function(rows){
    //返回 rows[0].count_total
    //数出符合where的总数量
})

``` 
### 时间统计快捷方式 countTodyByWhere countMonthByWhere countWeekByWhere 
根据时间字段进行统计 时间字段可以自定义 
```javascript
//时间字段默认为  'create_time'
teacher.countTodyByWhere(id,function(rows){ 
//返回 rows[0].count_total
//统计当天的数值
    }) 


const time_colum_key = 'create_time'
teacher.countMonthByWhere(id,time_colum_key,function(rows){
    //返回 rows[0].count_total
    }) 
teacher.countWeekByWhere(id,time_colum_key,function(rows){
    //返回 rows[0].count_total
    }) 
``` 