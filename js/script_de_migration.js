var res = [];
var s = 0;
var e = 10;
var k = 0;

var rr = setInterval(function(){

	if(stores.length >= e){

		tmpStores = stores.slice(s, e);
		console.log('>>>>', s, e,'length of tmpStores', tmpStores.length);

		s += tmpStores.length;
		e += tmpStores.length;


		for(i in tmpStores){
			store = tmpStores[i]
			GMAP.getLatLngFromAddress(store)
		}

		console.log('i.', k, GMAP.tmp.markers);
		res = res.concat(GMAP.tmp.markers);
	}else{
		clearInterval(rr); console.log('STOP', e, res.length);
	}
	k++;
}, 5000);


var rr = setInterval(function(){

	if(k < stores.length){

		store = stores[k]
		GMAP.getLatLngFromAddress(store)
		

		console.log('i.', k);
		//res = res.concat(GMAP.tmp.markers);
	}else{
		clearInterval(rr); console.log('STOP', e, res.length);
	}
	k++;
}, 2000);