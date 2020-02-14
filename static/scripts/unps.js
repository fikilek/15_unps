console.log('START running unps.js')

$(document).ready(function() {

console.log('START unps.js document ready function')

	const ireps_ui_controller = (function(){

		const idt_columns_map = () => {
			columns_map = new Map();

	//	column names for unp_logon_history dt
			columns_map.set('unpha12_log_on_at_datetime', 'signin');
			columns_map.set('unpha13_log_out_at_datetime', 'signout');

	//	column names for unp_boqs dt
			columns_map.set("cycle", "cycle" );
			columns_map.set("qap", "qap" );
			columns_map.set("12grv", "grv" );
			columns_map.set("21ret", "ret" );
			columns_map.set("23alc", "alc" );
			columns_map.set("26mis", "mis" );
			columns_map.set("27rtd", "rtd" );
			columns_map.set("32una", "una" );
			columns_map.set("34ins", "ins" );
			columns_map.set("38rep", "rep" );
			columns_map.set("36mis", "mis" );
			columns_map.set("43uni", "uni" );
			columns_map.set("44com", "com" );
			columns_map.set("46mis", "mis" );
			columns_map.set("5iins", "ins" );
			columns_map.set("5rrea", "rea" );
			columns_map.set("5ppur", "pur" );
			columns_map.set("53uni", "uni" );
			columns_map.set("56mis", "mis" );
			columns_map.set("5mmai", "mai" );
			columns_map.set("5ffwn", "fwn" );
			columns_map.set("5ddcn", "dcn" );
			columns_map.set("5rrcn", "rcn" );
			columns_map.set("5lala", "ala" );
			columns_map.set("62rec", "rec" );
			columns_map.set("72bac", "bac" );
			columns_map.set("76mis", "mis" );
			columns_map.set("83rep", "rep" );
			columns_map.set("86mis", "mis" );
			return columns_map;
		}

		class IdtColumnNames {
			constructor(){
				columns_map = new Map();
			}
			set_columns_map = (url) => {

			}
		}

		class Idt {
			constructor(cols, data){
				this.cols = cols;
				this.data = data;
				this.dt_instance = $('#idt').DataTable({
					"select": "single",
		      "columns": this.cols,
		      "data": this.data,
		      "dom": '<"top"<"pml"><"pmr"B>>rt <"bottom"lip>',
					"initComplete": (settings, json) => {
		        //create the input search boxes at the top of the datatable on a row (tr) below thead.
		        //this is done by cloning tr of thead and append it to same thead of the datatable (#ireps_dt)
		        $('#idt thead tr').clone(false).appendTo( '#idt thead' );
		        $('#idt thead tr:eq(1) th').each( function () {
	            let title = $(this).text().trim();
	            $(this).html( '<input class="col_search" type="text" placeholder=" '+title+' " />' );
		        });
		        // Apply the search. this search function actually filters the column for a value in the input box
		        let self = this;
		        $('#idt thead').on('keyup change', '.col_search', function () {
	            self.dt_instance.column( $(this).parent().index() ).search( this.value ).draw();
		        });
					},
		    });
			}
			set_cols = () => {
				let self = this;
				self.dt_instance.columns().every(function(key, value) {
					$(self.dt_instance.column(key).header()).text(idt_columns_map().get($(self.dt_instance.column(key).header()).text().trim()));
				})
				return this;
			}
		}

		class IrepsPathname {
			constructor(){
				this.pathname = location.pathname;
				this.pathname_parts = this.pathname.split('/'); //pnp is pathname_parts
			}
			normalise_pnp = () => {
				this.pathname_parts.forEach((cv, index, ar) => { //cv is current_value
					cv =='%20'? ar[index] = '': cv = cv ;
				})
				return this;
			}
			get_pnp = () => this.pathname_parts;
		}

		return {
			Idt: Idt,
			IrepsPathname: IrepsPathname,
		}

	})(); //iuc


	const ireps_data_controller = (function(app){

		//**********************************************************************************************************************
		//ireps datatable class
		//**********************************************************************************************************************

		//create a constructor for unps
		class IdtObj {
			constructor(idb_obj) {
				this.idt_obj_data = [];
				this.idb_obj = idb_obj;
			}
			set_idt_data = () => {
				this.idt_obj_data = this.idb_obj.get_idb_obj_data();
				return this;
			}
			get_idt_obj_data = () => this.idt_obj_data;
			get_idt_obj_data_cols = () =>  create_dt_columns(this.idt_obj_data);
		}

		//**********************************************************************************************************************
		//ireps datatable class
		//**********************************************************************************************************************

		//**********************************************************************************************************************
		// ireps database class
		//**********************************************************************************************************************

		//create constructor for a class to query the ireps db table in the passed url
		class IdbObj {
			constructor() {
				this.idb_obj_data = [];
				this.idb_obj_url;
			}
			set_idb_obj_data = (url) => {
				return new Promise((resolve, reject) => {
					this.idb_obj_url = url;
					get_db_data(this.idb_obj_url)
						.then(response => {
							this.idb_obj_data = response;
							if(response){
								resolve(this);
							} else {
								reject("ERROR: could not get db data")
							}
						})
				})
			}
			get_idb_obj_data = () => this.idb_obj_data;
		}

		//promises to implement IdbObj
		const create_idbobj_prms = () => {
			return new Promise((resolve, reject) => {
				const idb_obj = new IdbObj();
				if(idb_obj){
					resolve(idb_obj);
				} else {
					reject('ERROR: failed to create a new idb_obj')
				}
			})
		}

		//create a promise to implement set_idb_obj_data
		const set_idb_obj_data_prms = (url, idbobj) => {
			return new Promise( (resolve, reject) => {
				idbobj.set_idb_obj_data(url)
					.then( response => {
						if(response){
							resolve(response);
						} else {
							reject ('error')
						}
					})
			})
		}

		//
		const get_idtobj = (url) => {
			return new Promise((resolve, reject) => {
				create_idbobj_prms()
					.then(response => {
						return set_idb_obj_data_prms(url, response);
					})
					.then(response => {
	//				we now have idb object. use it to setup idt object so we can build a datatable
						console.log('the idb object we want ',response);
						const idt_obj = new IdtObj(response).set_idt_data()
						if(idt_obj){
							resolve(idt_obj)
						} else {
							reject(error)
						}
					})
					.catch(error => {
						console.log(error);
					})
			})
		}

		//**********************************************************************************************************************
		// ireps database class - IdbObj
		//**********************************************************************************************************************

		//create a constructor for unps
		class Unps {
			constructor(url) {
				this.unps = [];
				this.url = url;
			}
			set_unps = () => {
				this.unps = new IdbUnps(this.url).set_unps().get_unps();
				return this;
			}
			get_unps = () => this.unps;
			get_unps_cols = () => create_dt_columns(this.unps);
		}

		//create constructor for a class to collect all unps from the ireps db
		class IdbUnps {
			constructor(url) {
				this.unps = [];
				this.url = url;
			}
			set_unps = () => {
					this.unps = get_db_data(this.url);
					return this;
			}
			get_unps = () => this.unps;
		}

		//create helper function to create columns of datatables
		const create_dt_columns = (dt_data) => {
			let cols, columns = false;
			if(dt_data){
				cols = Object.keys(dt_data[0]);
				columns = cols.map((value, index) => {
					return { 'data': value, 'title': value };
				});
			}
			return columns;
		}

		const get_db_data = async (url) => {
		  const response = await fetch(url, {
		    method: 'POST', // *GET, POST, PUT, DELETE, etc.
		  });
		  return await response.json(); // parses JSON response into native JavaScript objects
		}

		create_unps_object = (url) => {
			return new Promise( (resolve, reject) => {
				const unps_obj = new Unps(url).set_unps();
				if(unps_obj){
					resolve(unps_obj);
				} else {
					reject('error');
				}
			})
		}

		return {
			create_unps_object: create_unps_object,
			get_idtobj: get_idtobj,
		}

	})(); //idc

	//iuc : ireps user interface controller
	//idc : ireps data controller
	(function(iuc, idc){

		const pnp = new iuc.IrepsPathname().normalise_pnp().get_pnp() //pnp is pathname parts
		const ml1 = pnp[1];
		const ml2 = pnp[2];
		const ml3 = pnp[3];
		if(ml1 === 'admin'){

			if(ml2 === 'syst' && ml3 === 'arc'){
				idc.get_idtobj('../../../get_' + ml3 + '_data')
					.then(response => {
						const data = response.get_idt_obj_data();
						const cols = response.get_idt_obj_data_cols();
						const unps_dt = new iuc.Idt(cols, data).set_cols(iuc.idt_columns_map);
					})
			}
			else if (ml2 === 'unps'){
				idc.get_idtobj('../../../get_' + ml2 + '_data')
					.then(response => {
						const data = response.get_idt_obj_data();
						const cols = response.get_idt_obj_data_cols();
						const unps_dt = new iuc.Idt(cols, data).set_cols(iuc.idt_columns_map);
					})
			}
		}

	})(ireps_ui_controller, ireps_data_controller);

console.log('END trns.js document ready function')

});

console.log('END running trns.js')
