var Map = Map || {};
(function(window, _, exports, undefined) {
    'use strict';

    var map;
    var heatLayer;
    var data = null;
    var currentMarkersOnMap = [];
    var currentGatewaysOnMap = [];

    exports.gateways = [
        {
            id: 'eui-0000024b080e1013',
            lat: 48.404,
            lng: 9.9852,
            name: 'ulm.digital - Cortex Media Karlstrasse'
        },
        {
            id: 'eui-0000024b080e0d75',
            lat: 48.3985081189661,
            lng: 9.991811778526625,
            name: 'ulm.digital & Verschwörhaus - Ulmer Münster'
        },
        {
            id: 'eui-0000024b0b030205',
            lat: 48.3992,
            lng: 9.9935,
            name: 'ulm.digital - UNO GmbH Hafenbad'
        },
        {
            id: 'eui-0000024b0b03020e',
            lat: 48.403,
            lng: 9.9955,
            name: 'ulm.digital - SWP Frauenstrasse'
        },
        {
            id: 'eui-0000024b0b0301ea',
            lat: 48.3867,
            lng: 9.9756,
            name: 'ulm.digital - system.zwo Kuhberg'
        },
        {
            id: 'ttn-ulm-verschwoerhaus',
            lat: 48.3965,
            lng: 9.9902,
            name: 'ulm.digital - Verschwörhaus Indoor'
        },
        {
            id: 'eui-0000024b0b0301e0',
            lat: 48.42242987311834,
            lng: 9.95659171656550,
            name: 'ulm.digital - Uni Ulm'
        },
        {
            id: 'eui-7276ff000b0314a0',
            lat: 48.385823387593426,
            lng: 9.985580951233226,
            name: 'ulm.digital - Donaubad'
        },
        {
            id: 'eui-aa555a000b0311f9',
            lat:48.393710306823586,
            lng: 9.991316384268691,
            name: 'ulm.digital - Edwin-Scharff-Haus'
        },
        {
            id: 'eui-7076ff0056040065',
            lat: 48.38492561198574,
            lng: 9.957803312955997,
            name: 'Citysens - Schulzentrum Kuhberg'
        },
        {
            id: 'eui-fcc23dfffe0b6fcd',
            lat: 48.403957200864234,
            lng: 9.985167498917964,
            name: 'Citysens - Karlstrasse 1'
        },
        {
            id: 'eui-647fdafffe00a739',
            lat: 48.430948256137675,
            lng: 10.018304757520463,
            name: 'Citysens - Böfingen Hochhaus'
        },
        {
            id: 'eui-7076ff0056050523',
            lat: 48.396424492211956,
            lng: 9.990451772138279,
            name: 'Citysens / Stadt Ulm - LoraPark'
        },
        {
            id: 'eui-7276ff000b032417',
            lat: 48.39726170,
            lng: 9.97029634,
            name: 'SWU Telenet / Citysens - Bauhoferstraße'
        },
        {
            id: 'eui-0000024b0b030220',
            lat: 48.413197936550084,
            lng: 9.950905849136259,
            name: 'Studierendenwerk Ulm - Eselsberg'
        },
        {
            id: 'eui-0000024b09030b6e',
            lat: 48.41815768511138,
            lng: 9.939730925316319,
            name: 'THU - Eselsberg'
        },
        {
            id: 'eui-0000fcc23d0f9db2',
            lat: 48.38031967,
            lng: 10.01188675,
            name: 'HNU - Neu-Ulm'
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
        drawLegend();
    };


    var bind = function () {

        $(document).on('change', '.filter input[type=checkbox]', function (event) {

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
        var baseLayerMapBox = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18
        });

        map = L.map('map', {
            center: new L.LatLng(48.399, 10.0),
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

        map.on('click', function (mouseEvent) {
            console.log(mouseEvent.latlng.lat + ', ' + mouseEvent.latlng.lng);
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
            localGateways = _.filter(exports.gateways, function (gw) {
                return _.includes(activeGatewayIds, gw['id']);
            });
        } else {
            localGateways = exports.gateways;
        }

        _.forEach(localGateways, function (d) {

            var icon = L.icon({
                iconUrl: 'img/antenna.svg',
                iconSize:     [48, 48], // size of the icon
                iconAnchor:   [24, 42], // point of the icon which will correspond to marker's location
                popupAnchor:  [24, 24] // point from which the popup should open relative to the iconAnchor
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

    var drawLegend = function () {
        Map.gateways.forEach(function (item, index){
            $('#legend').append('<div><label><input type="checkbox" value="'+item['id']+'">'+item.name+'</label></div>');
        });
    };

})(window, _, Map);


// native ready callback
if ( document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    Map.init();
} else {
    document.addEventListener("DOMContentLoaded", Map.init());
}