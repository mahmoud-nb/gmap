/**
 * GMAP : plugin javascript pour utiliser Google Maps version 3
 * @autor : Mahmoud NBET
 * @email : mahmoud.nb@gmail.com
 */
 
const defaultOptions = {
	center: { lat: 25.046801, lng: 55.181436 }, 
	zoom: 9,
	//minZoom: 9,
	//disableDefaultUI: false,
	//zoomControl: true,
	//zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL},
};
const RED_MARKER = 'images/markers/red-marker.png';

const TRAVEL_MODES = ['DRIVING', 'BICYCLING', 'TRANSIT', 'WALKING'];
const MAP_TYPES = ['roadmap', 'terrain'];

const GMAP = {
	config: {
		...defaultOptions,
	    iconUserPos: RED_MARKER,
	    showInfoWindow: true,
	    enableBounds: false,
        enableGeocoder: true
	    //enableDirectionsService: true
	},
	mapOptions: {
	    center: { lat: 25.046801, lng: 55.181436 },
	    mapTypeControl: false,
	    mapTypeId: "roadmap", // "roadmap" || "terrain"
	    zoom: 7
	},
	markerOptions: {
	    //icon: 'images/marker_car.png',
	},
	map: null,
	markers: [],

    tmp: {
        markers: []
    },

	//bounds: google && google.maps ? new google.maps.LatLngBounds() : null, // TODO
	currentInfoWindow: null,
	directionsDisplay: null, // google && google.maps ? new google.maps.DirectionsRenderer() : null, // TODO
	directionsService: null, // google && google.maps ? new google.maps.DirectionsService() : null, // TODO
    geocoder: null,
	
	currentPosition: {
	    defaultLat: 25.046801,		// Latitude
	    defaultLng: 55.181436,		// Longitude
	},
	
	load: async function() {
		if(typeof google == "undefined")
			await _loadScriptAndreInit()
	},
	
	/**
	 * Map initialization
	 * @param mapContainer : dom
	 * @param options : init options
	 */
	init: function(mapContainer, options = {}, config = {}) {
		
        mapContainer = typeof mapContainer != "undefined" ? mapContainer : document.getElementById('mapContainer');
			
		this.config = {
			...this.config,
			...config,
		};
		
		this.mapOptions = {
			...this.mapOptions,
			...options,
		};
			
		if(_checkNested(options, 'center', 'lat') && _checkNested(options, 'center', 'lng'))
			this.mapOptions.center = new google.maps.LatLng(this.mapOptions.center.lat, this.mapOptions.center.lng);
		
		if(this.mapOptions.zoom)
			this.mapOptions.zoom = parseInt(this.mapOptions.zoom);

		this.map = new google.maps.Map(mapContainer, this.mapOptions);
			
        try {

            if(this.config.enableGeocoder)
                this.geocoder = new google.maps.Geocoder();

        }catch (e) {
            console.log( 'Geocoder exception' , e );
        }
		
		try {
			
            /*
		    if(this.config.enableDirectionsService){
		    	this.directionsService = new google.maps.DirectionsService();
		        this.directionsDisplay = new google.maps.DirectionsRenderer();
		        this.directionsDisplay.setMap(this.map);
		    }
			*/
		    
		}catch (e) {
			console.log( 'Directions exception' , e );
		}

        try {
                    
            if(this.config.enableBounds)
                this.bounds = new google.maps.LatLngBounds();
            
        }catch (e) {
            console.log( 'Bounds exception' , e );
        }
		
		return this;
	},
	
    /**
	 * set options map, Zomm, center map...
	 */
    setMapOptions: function (options) {
		
		if(_checkNested(options, 'center', 'lat') && _checkNested(options, 'center', 'lng'))
			options.center = new google.maps.LatLng(options.center.lat, options.center.lng);
		
		options.zoom = parseInt(options.zoom);
		
		if (typeof options != "undefined")
			this.map.setOptions(options);

        return this;
    },

    getFullAddress: function(store){
        return store.Adresse+' '+ store.Ville+' '+store.Code_Postal ;
    },

    getLatLngFromAddress: function(marker){

        address = this.getFullAddress(marker);

        this.geocoder.geocode({'address': address}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
               // console.log('########## location', results[0].geometry.location);

                marker.latitude = results[0].geometry.location.lat();
                marker.longitude = results[0].geometry.location.lng();

                GMAP.tmp.markers.push(marker);

            } else {

                marker.latitude = '';
                marker.longitude = '';

                GMAP.tmp.markers.push(marker);
            }
          });
    },

    /**
	 * add marker
	 * @params options : object{ title, content, latitude, longitude ... }
	 */
    addMarker: function (options) {
    	//console.log("addMarker", options);
        if(options){
            var self = this;
            $.extend(this.markerOptions, options);

            this.markerOptions.map = this.map;

            if(typeof options.latitude != "undefined" && typeof options.longitude != "undefined"){

                this.markerOptions.position = new google.maps.LatLng(options.latitude, options.longitude);

                marker = new google.maps.Marker(this.markerOptions);

                this.markers.push(marker);

                //google.maps.event.addListener(marker, 'click', self.showMarkerInfo( options ));
                
                if (this.config.showInfoWindow && typeof options.Ville != "undefined") {
        			//console.log('ADD INFO', this.config.showInfoWindow);
                    content = options.CT_Intitule != '' ? '<h3>' + options.CT_Intitule + '</h3>' : '';
                    content += options.Ville != '' || options.Adresse ? '<div>' + options.Adresse +' '+ options.Ville + '</div>' : '';
             
                    infoWindow = new google.maps.InfoWindow({ content: content });
                    this.currentInfoWindow = infoWindow ;
                    google.maps.event.addListener(marker, 'click', self.openInfoWindow(infoWindow, marker));
                    google.maps.event.addListener( infoWindow,'closeclick', self.closeInfoWindow(infoWindow));
                }

                if (this.config.enableBounds){
                    this.bounds.extend(marker.position);
                    this.map.fitBounds(this.bounds);
                }

            }
        }

        return this;
    },

    /**
	 * open InfoWindow
	 */
    openInfoWindow: function (infoWindow, marker) {
       return function () {
            // Close the last selected marker before opening this one.
            if (this.currentInfoWindow) {
            	this.currentInfoWindow.close();
            }
            
            infoWindow.open(this.map, marker);
            this.currentInfoWindow = infoWindow;

        };
    },

    showMarkerInfo2: function(marker){

        $('.markerData .markerTitle').text(marker.title);
        $('.markerData .markerContent').text(marker.content);
        $('.markerImg').attr('src', marker.images);
    },

    /**
	 * close InfoWindow
	 */
    closeInfoWindow: function (infoWindow) {
        return function () {
            infoWindow.close();
        };
    },

    /**
	 * Delete Marker
	 */
    deleteMarker: function (marker) {
        marker.setMap(null);
    },

    /**
	 * Clear Markers
	 */
    clearMarkers: function () {
        for (i in this.markers) {
            this.deleteMarker(this.markers[i]);
        }
		this.markers = [];
		return this;
    },

    /**
	 * load list of markers in the map
	 * @params items : array of objects
	 */
    addMarkers: function (items) {
        //console.log('generateMarkers', options);

        for (n in items) {
            var item = items[n];
            this.addMarker(item);
        }

        if (this.config.enableBounds && this.markers.length > 0)
            this.map.fitBounds(GMAP.bounds);

        return this;
    },

    /**
	 * return all markers
	 */
    getMarkers: function () {
        return this.markers;
    },

    /**
     * Find markers by attribute value
     */
    findMarkersBy : function (attr, value) { console.log('findBy', attr, value);
        if(typeof attr != "undefined" && typeof value != "undefined")
            for (i = 0; i < this.markers.length; i++) {
                marker = this.markers[i];
                // If is same category or category not picked
                if (marker[attr] == value) {
                    marker.setVisible(true);
                }
                // Categories don't match 
                else {
                    marker.setVisible(false);
                }
            }
    },

    findStoreBy : function (city, concessions) { 
            city = city.toLowerCase();
            concessions = concessions.toLowerCase();

            filterBounds = new google.maps.LatLngBounds();
        
            //for (i = 0; i < this.markers.length; i++) {
            for (i in this.markers) {
                marker = this.markers[i];

                showMarker = false;

                ville = marker.Ville.toLowerCase();
                intitule = marker.CT_Intitule.toLowerCase();
                
                if(city != '' && concessions != ''){
                    if ( ville == city && intitule == concessions ){ showMarker = true; }
                }else if(city != ''){
                    if ( ville == city ){ showMarker = true;  }
                }else if(concessions != ''){
                    if ( intitule == concessions ){ showMarker = true; }
                }

                if(showMarker){
                    filterBounds.extend(marker.position);
                }

                marker.setVisible(showMarker);
            }

            if(!filterBounds.isEmpty())
                this.map.fitBounds(filterBounds);
    },

    /**
     * Toggle markers by attribute value
     */

    toggleBy: function(attr, value){
        if(typeof attr != "undefined" && typeof value != "undefined")
            for (i = 0; i < this.markers.length; i++) {
                marker = this.markers[i];
                if (marker[attr] == value) {
                    isVisible = marker.getVisible();
                    marker.setVisible(!isVisible);
                }
            }
    },

    boundsPositions: function (positions) {
    	if(typeof this.bounds == "undefined")
    		this.bounds = new google.maps.LatLngBounds();
    	
        if (positions.length > 0) {
            for (i in positions) {
                p = new google.maps.LatLng(positions[i].k, positions[i].D);
                this.bounds.extend(p);
            }
            this.map.fitBounds(this.bounds);
        }
        return this;
    },


	/**
	 * Get Mid point
	*/
	getMidPoint: function(point1, point2) {
	  var lat = (point1.lat() + point2.lat()) / 2;
	  var lng = (point1.lng() + point2.lng()) / 2;
	  return {lat, lng};
	},
	
	getMidStep7:  function (steps) {
	  // Calcul du point milieu
	  const midpointIndex = Math.floor(steps.length / 2);
	  console.log('STEPS', steps.length, steps, midpointIndex)
	  const midpoint = steps[midpointIndex].start_location;
	  return midpoint;
	},
	
	getMidDirection: function (steps) {
	// Calcul de la distance totale du trajet
	  let totalDistance = 0;
	  steps.forEach(step => {
		totalDistance += step.distance.value;
	  });
	  // Calcul du point milieu en fonction de la distance parcourue
	  let distance = 0;
	  let midpoint;
	  let stepIndex = 0;
	  for (let i = 0; i < steps.length; i++) {
		distance += steps[i].distance.value;
		if (distance >= totalDistance / 2) {
		  //midpoint = steps[i].start_location;
		  stepIndex = i;
		  break;
		}
	  }
	  midpoint = steps[stepIndex].start_location;
	  return midpoint;
	},

    /**
     * Tracage du chemin entre deux points
     * @params options : { origin, destination | originLat, originLng, destinationLat, destinationLng  }
     */
    traceDirectionDeferred: function (options) {
    	var deferred = new $.Deferred();
		
		if(this.directionsService == null){
			this.directionsService = new google.maps.DirectionsService();
			this.directionsDisplay = new google.maps.DirectionsRenderer();
			this.directionsDisplay.setMap(this.map);
		}
		
        try {
            if (options) {
            	
                var start = "";
                var end = "";

                if (_checkNested(options, "originLat") && _checkNested(options, "originLng") && _checkNested(options, "destinationLat") && _checkNested(options, "destinationLng")) {
                    start = new google.maps.LatLng(options.originLat, options.originLng);
                    end = new google.maps.LatLng(options.destinationLat, options.destinationLng);
                } else if (_checkNested(options, "origin") && _checkNested(options, "destination")) {
                    start = options.origin;
                    end = options.destination;
                }
				
				console.log('R', options.travelMode, google.maps.TravelMode, google.maps.TravelMode[options.travelMode])

                var request = {
                    origin: start,
                    destination: end,
                    travelMode: google.maps.TravelMode[options.travelMode] // DRIVING | BICYCLING | TRANSIT | WALKING
                };

                this.directionsService.route(request,
  				    function (response, status) {
						console.log('directionsService', response, status);
  				        if (status == google.maps.DirectionsStatus.OK) {

  				            GMAP.directionsDisplay.setDirections(response);
  				            //GMAP.directionsDisplay.setOptions({'suppressMarkers':true});

  				            deferred.resolve(response);
  				        }
  				    });
            }

		
        } catch (e) {
        	console.log('exeption', e);
			console.log('MAP', this);
        }

        return deferred.promise();
    },
    
    /**
	 * Calculer la distance entre (en km) deux points
	 */
    rad: function (x) { return x * Math.PI / 180; },
    distHaversine: function (p1Lat, p1Lng, p2Lat, p2Lng) {
        var R = 6371; // earth's mean radius in km
        var dLat = GMAP.rad(p2Lat - p1Lat);
        var dLong = GMAP.rad(p2Lng - p1Lng);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(GMAP.rad(p1Lat)) * Math.cos(GMAP.rad(p2Lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;

        //console.log("disyance en KM ", d.toFixed(2));
        return d.toFixed(2);
    },
    
	nearbySearch: function (point, requestData) {
		
		var request = {
			location: new google.maps.LatLng(lat, lng),
			radius: '500',
			types: ['restaurant', 'cafe']
		};
		
		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				// Afficher les restaurants et les cafés trouvés
				for (var i = 0; i < results.length; i++) {
				  var place = results[i];
				  console.log(place.name);
				}
			}
		});
		
	},
	
    // ############################################################# DRAWING SHAPE
    /**
	 * Drawing Shape lib
	 * require load API : http://maps.google.ae/maps/api/js?libraries=drawing&sensor=false
	 */
    initDrawingShape: function (options) {
        this.drawingShapeOptions = options;
        if(typeof google.maps.drawing != "undefined"){
            this.getDrawingShape(options);
        }else{
            _loadScript('https://maps.googleapis.com/maps/api/js?libraries=drawing&callback=_getDrawingShape');
        }
        return this;
    },

    getDrawingShape: function (options) {

        options = typeof options != "undefined" ? options : this.drawingShapeOptions;
        console.log('getDrawingShape...', this);

        self = this;
        self.shapes = [];
        self.shape = typeof self.shape != "undefined" ? self.shape : {};
        

        this.drawingManager = new google.maps.drawing.DrawingManager({
            //drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                drawingModes: [
					//google.maps.drawing.OverlayType.MARKER,
					//google.maps.drawing.OverlayType.CIRCLE,
					//google.maps.drawing.OverlayType.POLYLINE,
					//google.maps.drawing.OverlayType.RECTANGLE,
					google.maps.drawing.OverlayType.POLYGON,
                ]
            },
            polygonOptions: {
                strokeColor: "#1E90FF",
                strokeOpacity: 0.8,
                strokeWeight: 1,
                fillColor: '#1E90FF',
                fillOpacity: 0.6,
                clickable: false,
                //editable: true,
                zIndex: 1
            }
        });

        if (options)
            if (options.polygonOptions)
                $.extend(this.drawingManager.polygonOptions, options.polygonOptions);

        this.drawingManager.setMap(this.map);

        google.maps.event.addListener(this.drawingManager, "overlaycomplete", function (event) {
        	self.shapes.push(event);
            overlayClickListener(event.overlay);
            self.shape.path = event.overlay.getPath().getArray();
            self.setDrawingManagerOptions(self.drawingManager, { drawingControl: false, drawingMode: '' });
            //self.drawingManager.setDrawingMode('');
        });

        function overlayClickListener(overlay) {
            google.maps.event.addListener(overlay, "mouseup", function (event) {
                self.shape.path = overlay.getPath().getArray();
            });
        };

        return this.drawingManager;
    },

    setDrawingManagerOptions: function (drawingManager, options) {
        drawingManager.setOptions(options);
    },

    drawShape: function (options, drawingManagerOptions) {
    	
    	this.shapes = typeof this.shapes != 'undefined' ? this.shapes : [] ;
    	this.shape = typeof this.shape != "undefined" ? this.shape : {} ;
    	
    	var polygonOptions = {
            strokeColor: "#1E90FF",
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: "#1E90FF",
            fillOpacity: 0.6
        };

        var coordinates = [];
        if (typeof options.polygonOptions != "undefined") {
            path = options.polygonOptions.path || [];
            if (path && Array.isArray(path))
                for (i in path)
                    coordinates.push(new google.maps.LatLng(path[i].k, path[i].D));

            options.polygonOptions.path = coordinates;
            //this.shape.path = coordinates;

            if (options.polygonOptions)
                $.extend(polygonOptions, options.polygonOptions);
        }

        // drawingManager Options
        if (typeof drawingManagerOptions != "undefined") {
            this.setDrawingManagerOptions(this.drawingManager, drawingManagerOptions);
        }
        
        var shape = new google.maps.Polygon(polygonOptions);
        shape.setMap(this.map);
        this.shape.path = shape.latLngs.j[0].j;
        this.shapes.push(shape);
        
        return this ;
    },

    getShapePath: function () {
        path = [];
        if (typeof this.shape != "undefined") {
            path = typeof this.shape.path != "undefined" ? this.shape.path : [];
        }
        return path;
    },

	// ############################################################ GeoLocalisation
    /**
	 * Load current position with Deferred (jQuery required)
	 */
    getCurrentPositionDeferred: function (options) {
        var deferred = new $.Deferred();
        showMarker = typeof options.showMarker != "undefined" ? options.showMarker : false;
        var options = {
            //maximumAge: 3000,
            //timeout: 5000,
            enableHighAccuracy: true
        };
        
        navigator.geolocation.getCurrentPosition(
			function (position) {
				//console.log('____getCurrentPosition DONE', position);
			    GMAP.userLatitude = position.coords.latitude;
			    GMAP.userLongitude = position.coords.longitude;
			    GMAP.userPos = new google.maps.LatLng(GMAP.userLatitude, GMAP.userLongitude);

			    if (showMarker) {
			        var markerOptions = { "latitude": GMAP.userLatitude, "longitude": GMAP.userLongitude, "icon": GMAP.config.iconUserPos };
			        GMAP.addMarker(markerOptions);
			    }

			    deferred.resolve(position);
			},

			function (error) {
			    //console.log('____getCurrentPosition FAIL', error);
			    //console.log('FAIL : position ===== '+ self.gMap.userLatitude +','+ self.gMap.userLongitude);
			    deferred.resolve(error);
			},
			options);

        // return promise so that outside code cannot reject/resolve the deferred
        return deferred.promise();
    }
    
};


/**
 * This function tests on all the object tree to verify if a property exist or not.
 * If deep property exists it returns true otherwise it will retrun false
 * @param obj
 * @returns {Boolean}
 */
function _checkNested(obj /*, level1, level2, ... levelN*/) {
	var args = Array.prototype.slice.call(arguments),
		obj = args.shift();
	
	if (obj == null) return false;
		
	for (var i = 0; i < args.length; i++) {
		if (!obj.hasOwnProperty(args[i])) 
			return false;
		
		obj = obj[args[i]];
		
		if (obj == null) return false;
	}
	
	return true;
}

function getLibPath(){
	const API_KEY = localStorage.getItem('g_api_key');
	const LANGUAGE = 'ar';
	return `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=3.exp&signed_in=true&language=${LANGUAGE}&libraries=drawing?callback=_initialize`
} 

function _loadScript(src) {
    return new Promise((resolve, reject) => {
        // Create script element and set attributes
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.defer = true;
        
		// Append the script to the DOM
        const el = document.getElementsByTagName('script')[0]
        el.parentNode.insertBefore(script, el)

        // Resolve the promise once the script is loaded
        script.addEventListener('load', () => {
            this.isLoaded = true
            resolve(script)
        })

        // Catch any errors while loading the script
        script.addEventListener('error', () => {
            reject(new Error(`${this.src} failed to load.`))
        })
    })
}

function _loadScriptAndreInit(){
    //googlePath = "http://maps.googleapis.com/maps/api/js?callback=_initialize" ;
    _loadScript(getLibPath());
}

function _initialize(){
    return GMAP.init();
}

function _getDrawingShape(){
    GMAP.getDrawingShape();
}