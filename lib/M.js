class M {
	constructor(table,conn){
		this.table = table;
		this.conn = conn;
	};
	del(where,cb){
		if (!where || JSON.stringify(where) == "{}") {
			throw "update where is empty"
		}
		this.conn.del(this.table,where,cb)
	}
	desc(cb) {
		this.conn.desc(this.table,  cb);
	};
	insert(data,cb) {
		if (data instanceof Array) {
			this.conn.insertMulti(this.table, data, cb);
		}else{
			this.conn.insert(this.table, data, cb);
		}
	};
	update (data,where,cb,nq) {
		if (!where || JSON.stringify(where) == "{}") {
			throw "update where is empty"
		}
		if (data instanceof Array) {
			throw "update data can't be a array"
		}else{
			this.conn.update(this.table, data,where, cb, nq )
		}
	};
	updateBatch(data,keys,where,cb) {
		console.log(keys)
		if (!keys || JSON.stringify(keys) == "{}") {
				throw "update keys is empty"
				return
		}
		if (data instanceof Array) {
			if(typeof where == 'function'){
				cb = where;
				where = null;
			}
			this.conn.update_batch(this.table, data,keys,where, cb)
		}else{
			throw "data is not a array"
		}
	};
	updateById (data,id,cb) {
		if (!id) {
				throw "where is empty"
				return
		}
		this.conn.update(this.table, data,{id:id}, cb)
	};
	getById (id,cb) {
		this.conn.select(this.table, {id:id}, cb)
	};
	getData(options,callback){
		let where = options.where;
		let limit = options.limit;
		let orderby = options.orderby;
		let groupby = options.groupby;
		let columns = options.columns;
		let join_sign = options.join_sign;
		let eq_sign = options.eq_sign
		let cb = options.callback;
		if(callback) cb = callback
		if(limit) limit = "limit " + limit
		if(orderby) orderby = "order by " + orderby
		if(groupby) groupby = "group by " + groupby 
		for(let k in where){
			if(where[k] == null){
				delete where[k]
			}
		}
		this.conn.select(this.table, where, cb, limit,orderby, groupby,columns,join_sign,eq_sign)
	};
	getAllByWhere (where,cb,limit,orderby) {
		if(limit) limit = "limit " + limit;
		for(let k in where){
			if(where[k] == null){
				delete where[k]
			}
		}
		this.conn.select(this.table, where, cb, limit,orderby)
	};
	getColumnsByWhere (columns,where,cb) {
		let opt = {
			columns:columns,
			where:where,
			callback:cb
		}
		this.getData(opt);
	};
	getColumnByWhereDis (columns,where,cb) {
		this.conn.selectColumnDis(this.table, columns,where, cb)
	};		
	getAllByToday (cb) {
		this.conn.select_by_duration(this.table,'today', cb)
	};
	getDataByDuration(options,callback){
		let where = options.where;
		let limit = options.limit;
		let orderby = options.orderby;
		let groupby = options.groupby;
		let columns = options.columns;
		let duration= options.duration || 'today';
		let create_time_key = options.create_time_key;
		let cb = options.callback;
		if(callback) cb = callback
		if(limit) limit = "limit " + limit
		if(orderby) orderby = "order by " + orderby
		if(groupby) groupby = "group by " + groupby 
		for(let k in where){
			if(where[k] == null){
				delete where[k]
			}
		}
		this.conn.select_by_duration(this.table,columns,where,duration,cb,group,limit,create_time_key)
	}
	countAllByWhere (where,cb) {
		this.conn.select_count(this.table, where, cb)
	};
	countTodyByWhere(where,create_time_key,cb){
		if(typeof create_time_key == 'function' ){
			cb = create_time_key;
			create_time_key = null;
		}
		this.conn.count_duration(this.table,where,"today",cb,create_time_key)
	};
	countMonthByWhere(where,create_time_key,cb){
		if(typeof create_time_key == 'function' ){
			cb = create_time_key;
			create_time_key = null;
		}
		this.conn.count_duration(this.table,where,"month",cb,create_time_key)
	}
	countWeekByWhere(where,create_time_key,cb){
		if(typeof create_time_key == 'function' ){
			cb = create_time_key;
			create_time_key = null;
		}
		this.conn.count_duration(this.table,where,"week",cb,create_time_key)
	};


}

module.exports = M
