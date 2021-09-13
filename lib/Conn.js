const mysql = require("mysql");
const M = require('./M')
class Conn {
	constructor(opt){
		this.pool = mysql.createPool({
            host:opt.host,
            user:opt.user,
            password:opt.password ,
            database:opt.database ,
            port:opt.port || 3306,
            charset:opt.charset || "utf8mb4",
            timezone:opt.timezone || 'Asia/Shanghai'
        });
        this.time_colum_key = opt.time_colum_key || 'create_time'
        this.debug = opt.debug || false;
	};
    table(table){
        return new M(table,this)
    }
    query(sql, callback, options) {
        if(this.debug) console.log(sql)
        this.pool.getConnection(function (err, conn) {
            if (err) {
                throw err;
            } else {
                conn.query(sql, options, function (err, results, fields) {
                    //释放连接  
                    if (err) {
                        throw err;
                    }
                    conn.release();
                 //   this.pool.releaseConnection(conn)
                    //事件驱动回调  
                    callback(results, fields);
                });
            }
        });
    }
    desc(table, callback) {
        const q = ` desc ${table}  `;
        this.query(q,callback)
    }
    select(table, where, callback, limit, orderby, groupby, columns, devide, eq_sign,join,on) {
        limit = limit || '';
        orderby = orderby || '';
        groupby = groupby || '';
        let what = "*"
        if (!columns || columns.length == 0 || columns == '*') {
            what = "*"
        } else {
            what = columns.join(',')
        }
        devide = devide || ' and '
        const where_str = obj2Str(where, devide, eq_sign);
        if(join && on ){
            table = join + on;
        }
        const q = `select ${what} from ${table} where ${where_str} ${groupby} ${orderby}  ${limit}`;
        this.query(q,callback)
    }
    selectColumnDis(table, columns, where, callback, limit, devide) {
        limit = limit || '';
        let what = "*"
        if (!columns || columns.length == 0 || columns == '*') {
            what = "*"
        } else {
            what = columns.join(',')
        }
        devide = devide || ' and '
        const where_str = obj2Str(where, devide);
        const q = `select DISTINCT ${what} from ${table} where ${where_str}  ${limit}`;
        this.query(q,callback)
    }
    select_count(table, where, callback) {
        const where_str = obj2Str(where, " and ");
        const q = `select count(*) count_toal from ${table} where ${where_str} `;
        this.query(q,callback)
    }
    selectByDuration(options, callback) {
        const where_str = obj2Str(options.where, " and ");
        let table = options.table;
        let groupby = options.groupby;
        let columns = options.columns;
        let duration = options.duration;
        let time_colum_key = options.time_colum_key || this.time_colum_key || 'create_time';
        const what = columns.join(',')
        if (groupby) {
            groupby = ` group by ${groupby} `
        } else {
            groupby = '';
        }
        let q = `select ${what} from ${table} where to_days(${time_colum_key}) = to_days(now()) and ${where_str}  ${groupby}  order by ${time_colum_key} desc`;
        if (duration == 'today') {
            q = `select ${what}  from ${table} where to_days(${time_colum_key}) = to_days(now()) and ${where_str}  ${groupby}  order by ${time_colum_key} desc`;
        }
        if (duration == 'week') {
            q = `select  ${what}  from ${table} where YEARWEEK(date_format(${time_colum_key},'%Y-%m-%d'),1) = YEARWEEK(now(),1) and ${where_str}   ${groupby} order by ${time_colum_key} desc;`;
        }
        if (duration == 'month') {
            q = `select  ${what}  from ${table} where date_format(${time_colum_key},'%Y-%m')=date_format(now(),'%Y-%m') and ${where_str}  ${groupby}  order by ${time_colum_key} desc;`;
        }
        if (duration == 'all') {
            q = `select  ${what}  from ${table}  where ${where_str}  ${groupby}  order by ${time_colum_key} desc`;
        }
        this.query(q,callback)
    }
    select_by_duration(table,column, where, duration, callback, groupby,limit,time_colum_key) {
        limit = limit || '';
        column = column.join(',') || '*'
        const where_str = obj2Str(where, " and ");
        if (groupby) {
            groupby = ` group by ${groupby} `
        } else {
            groupby = '';
        }
        time_colum_key = time_colum_key || this.time_colum_key || 'create_time';

        let q = `select ${column} from ${table} where to_days(${time_colum_key}) = to_days(now()) and ${where_str}  ${groupby}  order by ${time_colum_key} desc  ${limit}`;

        if (duration == 'today') {
            q = `select ${column} from ${table} where to_days(${time_colum_key}) = to_days(now()) and ${where_str}  ${groupby}  order by ${time_colum_key} desc  ${limit}`;
        }
        if (duration == 'week') {
            q = `select ${column} from ${table} where YEARWEEK(date_format(${time_colum_key},'%Y-%m-%d'),1) = YEARWEEK(now(),1) and ${where_str}   ${groupby} order by ${time_colum_key} desc  ${limit}`;
        }
        if (duration == 'month') {
            q = `select ${column} from ${table} where date_format(${time_colum_key},'%Y-%m')=date_format(now(),'%Y-%m') and ${where_str}  ${groupby}  order by ${time_colum_key} desc   ${limit}`;
        }
        if (duration == 'all') {
            q = `select ${column} from ${table}  where ${where_str}  ${groupby}  order by ${time_colum_key} desc   ${limit}`;
        }
        this.query(q,callback)
    }
    count_duration(table, where, duration, callback,time_colum_key) {
        let where_str = obj2Str(where, " and ");
        time_colum_key = time_colum_key || this.time_colum_key || 'create_time';

        let q = `select count(*) count_toal from ${table} where ${where_str} and to_days(${time_colum_key}) = to_days(now()) `;
        if (duration == 'week') {
            q = `select count(*) count_toal from ${table} where ${where_str} and YEARWEEK(date_format(${time_colum_key},'%Y-%m-%d'),1) = YEARWEEK(now(),1);`;
        }
        if (duration == 'month') {
            q = `select count(*) count_toal from ${table} where ${where_str} and date_format(${time_colum_key},'%Y-%m')=date_format(now(),'%Y-%m');`;
        }
        if (duration == 'all') {
            q = `select count(*) count_toal from ${table} where ${where_str}`;
        }
        this.query(q,callback)
    }
    update(table, data, where, callback, nq ) {
        const data_str = obj2Str(data, ",",nq);
        const where_str = obj2Str(where, " and ");
        const q = `update \`${table}\` set ${data_str}  where ${where_str}`;
        this.query(q,callback)
    }
    update_batch(table, data,keys, where, callback) {
        let wherekey = keys.whereKey;
        let updatekey = keys.updateKey;
        const where_str = obj2Str(where, " and ");
        let whenstr = [];
        let instr = [];
        for(let i = 0; i < data.length; i ++){
            let da = data[i]
            whenstr.push( `WHEN '${da[wherekey]}' THEN '${da[updatekey]}'`)
            instr.push( `'${da[wherekey]}'`)
        }
        whenstr = whenstr.join(" ")
        instr = "(" + instr.join(",") + ")"
        
        let q = `UPDATE \`${table}\` SET ${updatekey} = CASE ${wherekey} ${whenstr} END WHERE ${wherekey} IN ${instr} and ${where_str}`
        
        this.query(q,callback)
    }
    insert(table, data, callback) {
        //console.log(data);
        const key_arr = [];
        const value_arr = [];
    
        for (let k in data) {
            key_arr.push(k);
            if (data[k] == 'now()') {
                value_arr.push(`now()`)
            } else {
                value_arr.push(`'${data[k]}'`)
            }

        }
        const key_str = key_arr.join(",");
        const value_str = value_arr.join(",")
        const q = `insert into ${table} (${key_str}) values (${value_str})`;
        this.query(q,callback)
    }
    insertMulti(table, data, callback) {
        //console.log(data);
        const key_arr = [];
        const value_arr = [];
        let keystr = data[0]
        for (let k in keystr) {
            key_arr.push(k);
        }
        for(let i = 0; i < data.length ; i ++){
            let da = data[i];
            let v_arr = [];
            for(let k in da){
                if (da[k] == 'now()') {
                    v_arr.push(`now()`)
                } else {
                    v_arr.push(`'${da[k]}'`)
                }
            }
            value_arr.push(v_arr.join(","))
        }
        const key_str = key_arr.join(",");
        const value_str = value_arr.join("),(")
        const q = `insert into ${table} (${key_str}) values (${value_str})`;
        
        this.query(q,callback)
    }
    del(table, where, callback) {
        const where_str = obj2Str(where, " and ");
        const q = `delete from ${table} where ${where_str}`;
        this.query(q,callback)
    }
}
function obj2Str(obj, devide, like) {
    if (obj instanceof Array) {
        return objarr2Str(obj, devide, like)
    }
    if (!obj || JSON.stringify(obj) == "{}") {
        obj = { 1: 1 }
    }
    let eq = '='
    if (like) eq = like;
    const arr = [];
    for (let k in obj) {
        let v = obj[k];
        if (v == 'now()') {
            arr.push(`${k}=now()`)
        } else if (v == 'is null') {
            arr.push(`${k} is null`)
        } else if (v == 'is not null') {
            arr.push(`${k} is not null`)
        } else if (v.toString().substr(0, 3) == '>= ') {
            arr.push(`${k} ${v}`)
        } else if (v.toString().substr(0, 3) == '<= ') {
            arr.push(`${k} ${v}`)
        } else if (v.toString().substr(0, 3) == '<> ') {
            arr.push(`${k} ${v}`)
        } else if (v.toString().substr(0, 2) == '< ') {
            arr.push(`${k} ${v}`)
        } else if (v.toString().substr(0, 2) == '> ') {
            arr.push(`${k} ${v}`)
        } else if (eq == 'in') {
            arr.push(`${k} ${eq} ${v}`)
        } else if (eq == 'noqoute') {
            arr.push(`${k} = ${v}`)
        }else {
            arr.push(`${k} ${eq} '${v}'`)
        }
    }
    return arr.join(devide)
}
function objarr2Str(obj, devide, like) {
    if (!obj || JSON.stringify(obj) == "[]") {
        return " 1 = 1"
    }
    let eq = '='
    if (like) eq = like;
    const arr = [];
    for (let i = 0; i < obj.length; i++) {
        let o = obj[i];
        let v = o[1];
        let k = o[0];
        if (v == 'now()') {
            arr.push(`${k}=now()`)
        } else if (v == 'is null') {
            arr.push(`${k} is null`)
        } else if (v == 'is not null') {
            arr.push(`${k} is not null`)
        } else if (v.toString().substr(0, 3) == '>= ') {
            arr.push(`${k} ${v}`)
        } else if (v.toString().substr(0, 3) == '<= ') {
            arr.push(`${k} ${v}`)
        } else if (v.toString().substr(0, 3) == '<> ') {
            arr.push(`${k} ${v}`)
        } else if (v.toString().substr(0, 2) == '< ') {
            arr.push(`${k} ${v}`)
        } else if (v.toString().substr(0, 2) == '> ') {
            arr.push(`${k} ${v}`)
        } else if (eq == 'in') {
            arr.push(`${k} ${eq} ${v}`)
        }else if (eq == 'noqoute') {
            arr.push(`${k} = ${v}`)
        } else {
            arr.push(`${k} ${eq} '${v}'`)
        }
    }
    return arr.join(devide)
}
module.exports = Conn