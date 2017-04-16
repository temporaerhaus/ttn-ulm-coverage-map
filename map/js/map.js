var Map = Map || {};
(function(window, _, exports, undefined) {
    'use strict';

    var map;
    var heatLayer;
    var data = null;
    var currentMarkersOnMap = [];
    var currentGatewaysOnMap = [];

    var gateways = [
        {
            id: 'eui-0000024b080e1013',
            lat: 48.404,
            lng: 9.9852,
            name: 'GW1 - Cortex Media Karlstrasse'
        },
        {
            id: 'eui-0000024b0b030205',
            lat: 48.3992,
            lng: 9.9935,
            name: 'GW2 - UNO GmbH Hafenbad'
        },
        {
            id: 'eui-0000024b0b03020e',
            lat: 48.403,
            lng: 9.9955,
            name: 'GW3 - SWP Frauenstrasse'
        },
        {
            id: 'eui-0000024b0b0301ea',
            lat: 48.3867,
            lng: 9.9756,
            name: 'GW4 - system.zwo Kuhberg'
        },
        {
            id: 'eui-0000024b0b030220',
            lat: 48.394167,
            lng: 9.97045,
            name: 'GW5 - Studierendenwerk Eselsberg'
        },
        {
            id: 'eui-0000024b0b0301e0',
            lat: 48.3965,
            lng: 9.9906,
            name: 'GW6 - Verschwörhaus 1 Weinhof'
        },
        {
            id: 'eui-00800000a00003c7',
            lat: 48.3965,
            lng: 9.9902,
            name: 'GW7 - Verschwörhaus 2 Weinhof'
        }
    ];

    exports.init = function () {
        if (typeof Data != 'undefined') {
            data = Data.getData();
            console.log('Number of data points: ' + data.length);
        } else {
            console.log('Data object not defined');
        }

        if (data != null) {
            loadMap();
        }

        bind();
        insertKnownGateways();
    };


    var bind = function () {
        $('.filter input[type=checkbox]').on('change', function (event) {

            var activeFilter = [];
            $('.filter input[type=checkbox]:checked').each(function (index, element) {
                activeFilter.push($(this).val());
            });

            if (activeFilter.length > 0) {

                var _data = [];
                _.filter(data, function (datapoint) {
                    if (_.includes(activeFilter, datapoint[4])) {
                        _data.push(datapoint);
                    }
                });

                clearHeatmap();
                renderHeatmap(_data);

            } else {

                clearHeatmap();
                renderHeatmap(data);

            }

            insertKnownGateways(activeFilter);

        });
    };

    var loadMap = function() {
        var baseLayerMapBox = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoiY29ydGV4bWVkaWEiLCJhIjoiY2l3ZjNyNmR1MDA2cjJ5dW1tN2o0eHRyeiJ9.6BEJDEUBuZQzkxgStBoM8w'
        });

        map = L.map('map', {
            center: new L.LatLng(48.399, 9.981),
            zoom: 13,
            layers: [baseLayerMapBox],
            scrollWheelZoom: true
        });

        map.on('zoomend', function () {
            checkIfMarkerCanBeDrawn();
        });
        map.on('moveend', function () {
            checkIfMarkerCanBeDrawn();
        });

        // render it
        renderHeatmap(data);
    };

    var renderHeatmap = function (_data) {

        _data = _.map(_data, function (d) {
                return [d[1], d[2], Math.abs(d[3])];
            });

        heatLayer =  L.heatLayer(_data, {
            radius: 50,
            blur: 100,
            max: 130
        });
        heatLayer.addTo(map);
    };

    var clearHeatmap = function () {
        if (heatLayer != undefined) {
            heatLayer.remove();
        }
    };

    var checkIfMarkerCanBeDrawn = function() {
        if (map.getZoom() > 17) {
            removeMarkersFromMap();
            renderMarkerInBounds();
        } else {
            removeMarkersFromMap();
        }
    };

    var renderMarkerInBounds = function () {
        var bounds = map.getBounds();

        _.forEach(data, function (d) {
            if (bounds.contains(L.latLng(d[1], d[2]))) {
                var marker = L.marker([d[1], d[2]]);
                marker.bindPopup(
                    d[1] + ', ' + d[2] + '<br>RSSI: ' + d[3] + ' dBm'
                );
                marker.addTo(map);
                currentMarkersOnMap.push(marker);
            }
        });
    };

    var removeMarkersFromMap = function () {
        _.forEach(currentMarkersOnMap, function (marker) {
            marker.removeFrom(map);
        });
    };

    var removeGatewaysFromMap = function () {
        _.forEach(currentGatewaysOnMap, function (gw) {
            gw.removeFrom(map);
        });
        currentGatewaysOnMap = [];
    };

    var insertKnownGateways = function (activeGatewayIds) {

        // clear state is easiert than handle the marker. with only 6 markers performance is not a problem.
        removeGatewaysFromMap();

        var localGateways;
        if (activeGatewayIds != undefined && activeGatewayIds.length > 0) {
            localGateways = _.filter(gateways, function (gw) {
                return _.includes(activeGatewayIds, gw['id']);
            });
        } else {
            localGateways = gateways;
        }

        _.forEach(localGateways, function (d) {

            var icon = L.icon({
                iconUrl: 'antenna.png',
                iconSize:     [48, 48], // size of the icon
                iconAnchor:   [64, 64], // point of the icon which will correspond to marker's location
                popupAnchor:  [-40, -48] // point from which the popup should open relative to the iconAnchor
            });
            var marker = L.marker(
                [d['lat'], d['lng']],
                {icon: icon}
            );
            marker.bindPopup(
                d['name']
            );
            marker.addTo(map);

            currentGatewaysOnMap.push(marker);

        });

    };

})(window, _, Map);


// native ready callback
if ( document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    Map.init();
} else {
    document.addEventListener("DOMContentLoaded", Map.init());
}