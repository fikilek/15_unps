console.log('START running unps.js')

$(document).ready(function() {

console.log('START unps.js document ready function')

	const ireps_ui_controller = (function(){

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
			set_cols = (idt_columns_map) => {
				let self = this;
				self.dt_instance.columns().every(function(key, value) {
					$(self.dt_instance.column(key).header()).text(idt_columns_map().get($(self.dt_instance.column(key).header()).text().trim()));
				})
				return this;
			}
		}
		return {
			Idt: Idt,
		}

	})(); //iuc


	const ireps_data_controller = (function(app){


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
//			set_unps = () => {
//				return new Promise( (resolve, reject) => {
//					const db_unps = new IdbUnps(this.url);
//					if(db_unps){
//						resolve(db_unps);
//					} else {
//						reject(error);
//					}
//				});
//			};
			get_unps = () => this.unps;
			get_unps_cols = () => {
				return create_dt_columns(this.unps);
			}
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
//			set_unps = () => {
//				return new Promise( (resolve, reject) => {
//					const db_data = get_db_data(this.url)
//					if(db_data){
//						resolve(db_data);
//					} else {
//						reject(error);
//					}
//				});
//			};
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

		//async function get_db_data(url = '', data = {}) {
//		const get_db_data = async (url) => {
//		const get_db_data = async (url) => {
//		  const response = await fetch(url, {
//		    method: 'POST', // *GET, POST, PUT, DELETE, etc.
//		  });
//		  return await response.json(); // parses JSON response into native JavaScript objects
//		}

		const get_db_data = (url) => {

			let db_data = [];
      $.ajax({
        type: "POST",
        url: url,
        cache: false,
        async: false,
        success: function(data){
            db_data = data;
        }
      });
			return db_data;


//      fetch(url, {
//		    method: 'POST', // *GET, POST, PUT, DELETE, etc.
//		  })
//		  .then(response => {
//		    return response.json();
//		  })
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
			Unps: Unps,
			create_unps_object: create_unps_object,
		}

	})(); //idc

	//iuc : ireps user interface controller
	//idc : ireps data controller
	(function(iuc, idc) {

		create_unps_object("../../../get_unps_data")
			.then( response => {
				console.log('response from create_unps_object',response);


			const data = response.get_unps();
			console.log('dt_data', data)

			const cols = response.get_unps_cols();
			console.log('dt_cols', cols)

			const unps_dt = new iuc.Idt(cols, data).set_cols(uuc.idt_columns_map);

			})
			.catch(error => {
				console.log('error',error);
			})


//		let unps = new idc.Unps("../../../get_unps_data");
//		unps.set_unps()
//			.then(idb_object => {
//				console.log('idb_object',idb_object);
//				return idb_object; //IdbUnps object is returned
//			})
//			.then( response => {
//				console.log('response', response);
//				return response.set_unps()
//			})
//			.then( response => {
//				console.log('response', response);
//				return response;
//			})
//			.catch(error => {
//				console.log(error)
//			})
//
//			const data = uobj.get_unps();
//			console.log('dt_data', data)
//
//			const cols = uobj.get_unps_cols();
//			console.log('dt_cols', cols)


//				})

//				console.log('unps_obj', unps_obj)

//		draw_unps_dt = async () => {
//
//			const unps = await new idc.Unps();
//
//			const data = unps_obj.get_unps();
//
//			const cols = unps_obj.get_unps_cols();
//
//			const unps_dt = new iuc.Idt(cols, data).set_cols(uuc.idt_columns_map);
//
//		}

//		draw_unps_dt();







	})(ireps_ui_controller, ireps_data_controller);

console.log('END trns.js document ready function')

});

console.log('END running trns.js')
