class M {
	constructor(table,conn,opt){
		this.table = table;
		this.conn = conn;
		this.inject_conn = conn.inject_before || null;
		this.inject_where = opt && opt.inject || null;
		this.total_per_page = opt && opt.total_per_page  || conn.total_per_page || null
	};
	set_injectWhere(inject){
		this.inject_where = inject
	}
	del(where,cb){
		for (let k in where) {
			if(where[k] == null) {
				delete where[k]
			}
		}
		if(this.inject_where) where = this.inject_where(where,'del')
		if (!where || JSON.stringify(where) == "{}") {
			throw "update where is empty"
		}
		this.conn.del(this.table,where,cb)
	}
	desc(cb) {
		this.conn.desc(this.table,  cb);
	};
	showCreate(cb) {
		this.conn.show_create(this.table,  cb);
	};
	show(cb) {
		this.conn.show_full_columns(this.table,  cb);
	};
	insert(data,cb) {
		if (data instanceof Array) {
			this.conn.insertMulti(this.table, data, cb);
		}else{
			this.conn.insert(this.table, data, cb);
		}
	};
	update (data,where,cb,nq) {
		for (let k in where) {
			if(where[k] == null) {
				delete where[k]
			}
		}
		if(this.inject_where) where = this.inject_where(where,'update')
		if (!where || JSON.stringify(where) == "{}") {
			throw "update where is empty"
		}
		this.conn.update(this.table, data,where, cb, nq )
		return this;
	};
	updateBatch(data,keys,where,cb) {
		console.log(keys)
		for (let k in where) {
			if(where[k] == null) {
				delete where[k]
			}
		}
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
		const opt = {table:this.table, where:{id:id}, callback:cb}
		this.conn.selectQuery(opt)
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
		let page = options.page;
		let total_per_page = options.total_per_page
		let join = options.join
		let join_table = options.join_table
		let on = options.on
		if(callback) cb = callback
		if(limit) limit = "limit " + limit
		if(orderby) orderby = "order by " + orderby
		if(groupby) groupby = "group by " + groupby 
		if(this.inject_where) where = this.inject_where(where,'getData')
		if(options.inject_where) where = options.inject_where(where,'getData')
		for(let k in where){
			if(where[k] == null){
				delete where[k]
			}
		}
		let cache_time = options.cacheTime || null;
		if(page){
			page = Number(page) || 1
			total_per_page = Number(total_per_page) || this.total_per_page || 15
			let start = total_per_page * (page -1)
			limit = `limit ${start}, ${total_per_page}`
		}
		if(join && join_table && on && on.length >= 2){
			join = `  \`${this.table}\` ${join} JOIN \`${join_table}\` `
			on = `on \`${this.table}\`.${on[0]} = \`${join_table}\`.${on[1]}`
		}
		const opt = {table:this.table, where:where, callback:cb, limit:limit, orderby:orderby, groupby:groupby, columns:columns,
					 devide:join_sign, eq_sign:eq_sign,
					 on: options._on,no_cache: options.no_cache,cache_key: options.cache_key,cache_time:cache_time,
					join:join,on:on}
		this.conn.selectQuery(opt)
	};
	find(options){
		getData(options,callback)
	};
	getAllByWhere (where,cb,limit,orderby) {
		if(this.inject_where) where = this.inject_where(where,'getAllByWhere')
		if(limit) limit = "limit " + limit;
		for(let k in where){
			if(where[k] == null){
				delete where[k]
			}
		}
		const opt = {table:this.table, where:where, callback:cb, limit:limit, orderby:orderby}
		this.conn.selectQuery(opt)
	};
	get(where,cb,limit,orderby) {
		this.getAllByWhere(where,cb,limit,orderby)
	};
	getColumnsByWhere (columns,where,cb) {
		if(this.inject_where) where = this.inject_where(where,'getColumnsByWhere')
		let opt = {
			columns:columns,
			where:where,
			callback:cb
		}
		this.getData(opt);
	};
	getc(columns,where,cb) {
		if(this.inject_where) where = this.inject_where(where,'getColumnsByWhere')
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
		this.conn.select_by_duration(this.table,columns,where,duration,cb,groupby,limit,create_time_key)
	}
	countAllByWhere (where,cb) {
		this.conn.select_count(this.table, where, cb)
	};
	count (where,cb,alias) {
		alias = alias || 'count_total'
		this.conn.select_count(this.table, where, cb,alias)
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
	select(columns){
		let a = new M(this.table,this.conn);
		a.select = true;
		a.cols = columns;
		return a
	}
	innerJoin(table){
		let a = new M(this.table,this.conn);
		a.join_table = table
		a.join = `  ${this.table} inner JOIN ${table} `
		return a
	}
	leftJoin(table){
		let a = new M(this.table,this.conn);
		a.join_table = table
		a.join = `  ${this.table} left JOIN ${table} `
		return a
	}
	rightJoin(table){
		let a = new M(this.table,this.conn);
		a.join_table = table
		a.join = `  ${this.table} right JOIN ${table} `
		return a
	}
	fullJoin(table){
		let a = new M(this.table,this.conn);
		a.join_table = table
		a.join = `  ${this.table} full JOIN ${table} `
		return a
	}
	on(a,b){
		if(!this.join_table){
			throw "please join a table first"
		}
		this._on = `on ${this.table}.${a} = ${this.join_table}.${b}`
		return this;
	}
	where(where,options){
		for(let k in where){
			if(where[k] == null){
				delete where[k]
			}
		}
		this._where = where
		if(options){
			this.eq_sign = option.eq_sign;
			this.join_sign = option.contact_sigh;
		}
		return this;
	}
	columns(columns){
		this.cols = columns;
		return this;
	}
	from(table){
		this.table = table
		return this
	}
	orderby(orderby){
		this._orderby =  "order by " + orderby
		return this;
	}
	groupby(groupby){
		this._groupby = "group by " + groupby 
		return this;
	}
	limit(limit){
		this._limit = "limit " + limit
		return this;
	}
	cacheKey(key){
		this.cache_key = key;
		return this;
	}
	cacheTime(cacheTime){
		this.cacheTime = cacheTime;
		return this;
	}
	noCache(){
		this.no_cache = true;
		return this;
	}
	exec(cb){
		if(!this.select){
			throw "please select() first"
		}
		const opt = {table:this.table, where: this._where, callback:cb, limit:this._limit, orderby:this._orderby, groupby:this._groupby, columns:this.cols,
			devide:this.join_sign, eq_sign:this.eq_sign,join:this.join, 
			on: this._on,no_cache: this.no_cache,cache_key: this.cache_key,cache_time:this.cacheTime}
		this.conn.selectQuery(opt)
	}
}

module.exports = M
