jQuery(function ($) {
    'use strict';
    var map, markers = [], snazzyWindow, markersClusters, clusterStyles, previousPopup, centerLatlng, mapOptions, styles, styledMap;

    function addMarker(lat, lng, type, name, popupContent) {
        var markerImage = {
            url: type === 'country' ? $('#map').attr('data-img-country') : type === 'city' ?  $('#map').attr('data-img-city') : type === 'places' ? $('#map').attr('data-img-place') : $('#map').attr('data-img-simple'),
            scaledSize : new google.maps.Size(60, 68),
        };

        var markerLatLng = new google.maps.LatLng(lat,lng);

        markers[name] = new google.maps.Marker({
            position: markerLatLng,
            icon: markerImage,
            name: name,
            content: popupContent,
        });
        markers[name].setMap(map);

        google.maps.event.addListener(markers[name], 'click', function(){
            showPreviosMarker();
            showInfowindow(markers[name]);
            previousPopup = markers[name];
            markers[name].setMap(null);

            setTimeout(function () {
                $('.shortcode-type10').addClass('show');
            },100);
        });

    }

    function initMap() {
        centerLatlng = new google.maps.LatLng($('#map').attr("data-lat"),$('#map').attr("data-lng"));

        mapOptions = {
            zoom: parseInt($('#map').attr("data-zoom")),
            zoomControl: true,
            center: centerLatlng,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
            }
        };

        styles  = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"poi.business","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.airport","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.bus","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#cfe5ef"},{"visibility":"on"}]}];
        styledMap = new google.maps.StyledMapType(styles,{name: "Styled Map"});


        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');

        snazzyWindow = new SnazzyInfoWindow({
            map: map,
            closeOnMapClick: false,
            border: false,
            callbacks: {
                close: function(){
                    showPreviosMarker();
                }
            }
        });

        clusterStyles = [{
                url: $('#map').attr("data-img-cluster"),
                height: 70,
                width: 70,
                textColor: '#000',
                textSize: 14
            }
        ];

        // Ajax. get map marker info
        $.ajax({
            url: 'mapLocations.json',
            type: 'get',
            dataType: 'json',
            error: function (error) {
                console.log(error)
            },
            success: function (response) {
                response.forEach(function(country) { // Create country marker
                    addMarker(country.coordinates.lat, country.coordinates.lng, country.type, country.name, country.popupContent);

                    if ( country.places ) {
                        country.places.forEach(function (capitalPlace) {
                            addMarker(capitalPlace.coordinates.lat, capitalPlace.coordinates.lng, capitalPlace.type, capitalPlace.name, capitalPlace.popupContent);
                        })
                    }

                    if ( country.city ) {
                        country.city.forEach(function(city) { // Find inside country city and create marker city
                            addMarker(city.coordinates.lat, city.coordinates.lng, city.type, city.name, city.popupContent);

                            if ( city.places ) {
                                city.places.forEach(function(place) { // Inside city find places and create places marker
                                    addMarker(place.coordinates.lat, place.coordinates.lng, place.type, place.name, place.popupContent);
                                })
                            }

                        })
                    }

                });
                markersClusters = new MarkerClusterer(map, markers, {styles: clusterStyles});
            }
        });
    }

    function showInfowindow(marker){
        snazzyWindow.setContent(marker.content);
        snazzyWindow.setPosition(marker.position);
        snazzyWindow.open();
        map.panTo(marker.position);
    }

    function showPreviosMarker() {
        if ( previousPopup ) previousPopup.setMap(map);
    }


    setTimeout(function () {
        initMap();

    },500)

});

function showPopupShare() {
    if ( document.querySelector('.shortcode-type10').classList.contains('showShare') ) {
        document.querySelector('.shortcode-type10').classList.remove('showShare');
    } else {
        document.querySelector('.shortcode-type10').classList.add('showShare');
    }

}
