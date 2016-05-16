// Step 1 ## load google map and gmap.js in your browser // <script src="https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=drawing"></script>
// Or copy the flowing object in your console browser

// SMall GMAP Service...
var GMAP = {
    tmp: { markers: []},
	init: function(){
		this.geocoder = new google.maps.Geocoder();
	},
	getFullAddress: function(store){return store.Adresse+' '+ store.Ville+' '+store.Code_Postal ;},
    getLatLngFromAddress: function(marker){

        address = this.getFullAddress(marker);

        this.geocoder.geocode({'address': address}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
				// console.log('########## location', results[0].geometry.location);
                marker.latitude = results[0].geometry.location.lat();
                marker.longitude = results[0].geometry.location.lng();
                GMAP.tmp.markers.push(marker);
            } else {
				// if address not found
                marker.latitude = ''; marker.longitude = '';
                GMAP.tmp.markers.push(marker);
            }
		});
    },
} ;

// Step 2 ## stores is a JSON of all markers
var stores = []; // JSON array of all markers 

// Step 3 ## copy and run this flowing code in your console
var k = 0;
GMAP.init();
var rr = setInterval(function(){

	if(k < stores.length){

		store = stores[k];
		GMAP.getLatLngFromAddress(store);
		
		console.log('i.', k);
		//res = res.concat(GMAP.tmp.markers);
	}else{
		clearInterval(rr); console.log('STOP', e, GMAP.tmp.markers.length + ' markers');
	}
	k++;
}, 2000);

// Step 4
stores = GMAP.tmp.markers;

// Step 5
storesStr = GMAP.tmp.markers.stringify();

// Step 6 ## passer la résultat sur "http://pro.jsonlint.com/" pour récupérer le nouveau JSON avec lat - lng

// SMall GMAP Service...



















/*
var res = []; var e = 10; var s = 0; var k = 0;
var rr = setInterval(function(){
	if(stores.length >= e){
		tmpStores = stores.slice(s, e);console.log('>>>>', s, e,'length of tmpStores', tmpStores.length);
		s += tmpStores.length;e += tmpStores.length;
		for(i in tmpStores){store = tmpStores[i]GMAP.getLatLngFromAddress(store)}
		console.log('i.', k, GMAP.tmp.markers);
		res = res.concat(GMAP.tmp.markers);
	}else{clearInterval(rr); console.log('STOP', e, res.length);}
	k++; }, 5000);
*/

