// list of markers created during the initialization
var markers = [];
var largeInfowindow;

// Initialize the application
function initApp() {
	ko.applyBindings(new ViewModel());
}

// Notify user about errors if happen during loading Google Maps
function mapError() {
	$('#map').html('Error occurred while loading Google maps');
}

// ViewModel function
function ViewModel() {
	// initialize the Map
	initMap();
	// connect search input and list all locations using Knockout
	this.searchInput = ko.observable("");
	var self = this;
	this.locations = ko.computed(function() {
		var result = [];
		markers.forEach(function(marker) {
			if (marker.title.toLowerCase().includes(self.searchInput().toLowerCase())) {
				result.push(marker);
				marker.setVisible(true);
			} else {
				marker.setVisible(false);
			}
		});
		return result;
	}, this);
}

// Create map and initialize it with markers
function initMap() {
	// Initialize the map and centralize it with specified latlng info
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 30.098961,
			lng: 31.329179
		},
		zoom: 14
	});
	// Create infowindow
	largeInfowindow = new google.maps.InfoWindow();
	// Add markers
	locations.forEach(function(newVenue) {
		markers.push(new Venue(newVenue));
	});
}

// Create infowindow on top of markers
function createInfowindow() {
	marker = this;
	infowindow = largeInfowindow;
	// Bounce when show infowindow
	marker.setAnimation(google.maps.Animation.BOUNCE);
	// Set BOUNCE animation timeout
	setTimeout(function() {
		self.marker.setAnimation(null);
	}, 1200);
	// Fill the fetched info from Foursquare API
	setFoursquareContent(infowindow);
	infowindow.marker = marker;
	infowindow.open(map, marker);
}

// Fill infowindow with information fetched from Foursquare API
function setFoursquareContent(infowindow) {
	// Construct the URL which will be used
	var url = 'https://api.foursquare.com/v2/venues/search?v=20180125&ll=' + marker.position.lat() + ',' + marker.position.lng() + '&client_id=DSSY0XT4J1GLJ1USG0PWXLWBHG0COADELQ5NJUMQSLDOOCQY&client_secret=RW123CNTQ2IOOOB1GGXS4BUABFPHLQTP5ME5H5NTEGC10WGP&v=20130815&query=' + marker.title;
	// Fetch data from Foursquare
	$.getJSON(url).done(function(marker) {
		response = marker.response.venues[0];
		// parse Foursquare response
		var name = response.name;
		var category = response.categories[0].name;
		var street = response.location.formattedAddress[0];
		var city = response.location.formattedAddress[1];
		var country = response.location.country;
		// format content for the info window
		content = '<h6>' + name + '</h6><p><b>Category: </b><i>' + category + '</i></p>' + '<p><b>Address: </b><i>' + street + ', ' + city + ', ' + country + '</i></p>';
		infowindow.setContent(content);
	}).fail(function() {
		// notify user about errors if happen during fetching the data
		infowindow.setContent('Error occurred while retrieving data from Foursquare');
	});
}

// create a venue
var Venue = function(venue) {
	this.title = venue.title;
	this.type = venue.type;
	var point = new google.maps.LatLng(venue.lat, venue.long);
	var marker = new google.maps.Marker({
		position: point,
		title: venue.title,
		map: map,
		animation: google.maps.Animation.DROP
	});
	this.marker = marker;
	this.setVisible = function(visibility) {
		this.marker.setVisible(visibility);
	};
	this.marker.addListener('click', createInfowindow);
	// trigger click event to show info window
	this.showInfo = function() {
		google.maps.event.trigger(this.marker, 'click');
	};
};
