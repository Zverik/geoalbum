// GeoAlbum.js. Inspired by Tom MacWright's Big, partly based on Weenote, written by Ilya Zverev. Licensed WTFPL.

var geoAlbumInitialized = false;
window.onload = function() { initGeoAlbum(); }

function initGeoAlbum() {
    if( geoAlbumInitialized ) return;
    geoAlbumInitialized = true;

    var prevText = '&larr; Назад';
    var nextText = 'Дальше &rarr;';
    var detailZoom = 15;
    var overviewZoom = 10;

    var body = document.body;
    var pages = {};
    var page;
    var content;
    var pageMarkersLayer = L.layerGroup();
    var photoMarkers = {};
    var currentDetailLayer;
    var overviewMap, detailMap;
    
    function process( page, idx ) {
        // find all coordinates, also mark photos
        var lat = 0.0, lon = 0.0;
        var photoIndices = 'ABCDEFGHIJKLMN';
        var photoIdx = 0;
        var photoLayer = L.layerGroup();
        var children = page.childNodes;
        for( var i = 0; i < children.length; i++ ) {
            var child = children[i];
            if( child.nodeType != 1 ) continue;
            var images = child.getElementsByTagName('img');
            if( images.length > 0 ) {
                child.className = 'div-p ' + child.className;
                child.style.overflowX = 'auto';
            }
            if( child.hasAttribute('lat') && child.hasAttribute('lon') ) {
                var plat = +child.getAttribute('lat');
                var plon = +child.getAttribute('lon');
                lat += plat; lon += plon;
                var letter = photoIndices[photoIdx++];
                photoLayer.addLayer(L.letterMarker([plat, plon], letter, {clickable: false}));
                var letterDiv = document.createElement('div');
                letterDiv.className = 'photoidx';
                letterDiv.appendChild(document.createTextNode(letter));
                child.insertBefore(letterDiv, child.firstChild);
            }
        }
        if( photoIdx > 0 )
            photoMarkers[idx] = photoLayer;

        if( page.hasAttribute('lat') && page.hasAttribute('lon') ) {
            lat = +page.getAttribute('lat');
            lon = +page.getAttribute('lon');
        } else if( photoIdx > 0 ) {
            lat /= photoIdx;
            lon /= photoIdx;
        }
        if( lat > 0 ) {
            pageMarkersLayer.addLayer(L.letterMarker([lat, lon], idx)
                .on('click', function() { window.location.hash = idx}));
        }
        
        // Add navigation links
        var nav = '';
        if( idx > 1 ) nav += '<a class="navleft" href="#' + (+idx-1) + '">' + prevText + '</a>';
        if( idx < count ) nav += '<a class="navright" href="#' + (+idx+1) + '">' + nextText + '</a>';
        nav += '</div>';
        page.innerHTML = '<div class="nav">' + nav + '<div style="clear: both;"></div>' + page.innerHTML + '<div class="nav nav-bottom">' + nav;
    }
    
    function zoomOnLayerGroup( map, layer ) {
        var clat = 0.0, clon = 0.0, ccount = 0;
        layer.eachLayer(function(m) {
            clat += m.getLatLng().lat;
            clon += m.getLatLng().lng;
            ccount++;
        });
        if( ccount > 0 )
            map.panTo([clat/ccount, clon/ccount]);
    }

    for( var d, count = 0; d = body.firstChild; ) {
        if( d.nodeType == 1 && d.localName != 'script' ) pages[++count] = d;
        body.removeChild(d);
    }
    for( var p in pages ) process(pages[p], p);
    body.innerHTML = '<div id="content"></div><div id="maps"><div id="overviewmap"></div><div id="detailmap"></div></div>';
    content = document.getElementById('content');
    content.appendChild(document.createComment(''));
    
    var overviewMap = L.map('overviewmap', {keyboard: false}).setView([60, 30], overviewZoom);
    L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 13, minZoom: 8
    }).addTo(overviewMap);
    if( typeof overviewLayer != 'undefined' )
        overviewMap.addLayer(overviewLayer);
    overviewMap.addLayer(pageMarkersLayer);
    zoomOnLayerGroup(overviewMap, pageMarkersLayer);
    
    var detailMap = L.map('detailmap', {keyboard: false}).setView([60, 30], detailZoom);
    L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 18, minZoom: 13
    }).addTo(detailMap);
    if( typeof detailLayer != 'undefined' )
        detailMap.addLayer(detailLayer);
    
    !function sync() {
        setTimeout(sync, 50);
        var next = 0 | location.hash.match(/\d+/);
        next = Math.max(Math.min(count, next), 1);
        if( page == next ) return;
        location.hash = page = next;
        content.replaceChild(pages[page], content.firstChild);
        window.scrollTo(0,0);
        if( overviewMap && detailMap ) {
            pageMarkersLayer.eachLayer(function(m) {
                m.setColor(m.options.letter == page ? 'blue' : 'black');
                if( m.options.letter == page )
                    overviewMap.panTo(m.getLatLng());
            });
            if( currentDetailLayer )
                detailMap.removeLayer(currentDetailLayer);
            if( page in photoMarkers ) {
                currentDetailLayer = photoMarkers[page];
                detailMap.addLayer(currentDetailLayer);
                zoomOnLayerGroup(detailMap, currentDetailLayer);
                detailMap.setZoom(detailZoom);
                document.getElementById('detailmap').style.visibility = 'inherit';
            } else
                document.getElementById('detailmap').style.visibility = 'hidden';
        }
    }();

    document.onkeydown = function(e) {
        var next = e.which == 39 ? page + 1 : e.which == 37 ? page - 1 : page;
        if( next in pages )
            location.hash = next;
    }
}

L.LetterMarker = L.Marker.extend({
    options: {
        letter: 'A',
        color: 'black',
        riseOnHover: true,
        icon: new L.DivIcon({popupAnchor: [2, -2]})
    },

    initialize: function( latlng, letter, options ) {
        L.Marker.prototype.initialize.call(this, latlng, options);
        this.options.letter = letter;
    },

    _initIcon: function() {
        var options = this.options,
            map = this._map,
            animation = (map.options.zoomAnimation && map.options.markerZoomAnimation),
            classToAdd = animation ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide';

        if (!this._icon) {
            var div = document.createElement('div');
            div.innerHTML = '' + options.letter + '';
            div.className = 'leaflet-marker-icon';
            div.style.marginLeft = '-7px';
            div.style.marginTop  = '-7px';
            div.style.width      = '15px';
            div.style.height     = '15px';
            div.style.borderRadius = '7px';
            div.style.fontSize   = '10px';
            div.style.fontFamily = 'sans-serif';
            div.style.fontWeight = 'bold';
            div.style.textAlign  = 'center';
            div.style.lineHeight = '15px';
            div.style.cursor     = options.clickable ? 'hand' : 'default';
            div.style.color      = 'white';
            div.style.backgroundColor = options.color;
            this._icon = div;

            if (options.title) {
                this._icon.title = options.title;
            }

            this._initInteraction();

            L.DomUtil.addClass(this._icon, classToAdd);

            if (options.riseOnHover) {
                L.DomEvent
                    .on(this._icon, 'mouseover', this._bringToFront, this)
                    .on(this._icon, 'mouseout', this._resetZIndex, this);
            }
        }

        var panes = this._map._panes;
        panes.markerPane.appendChild(this._icon);
    },

    setColor: function( color ) {
        if( !this._icon )
            this.options.color = color;
        else
            this._icon.style.backgroundColor = color;
    }
});

L.letterMarker = function(latlng, letter, options) {
    return new L.LetterMarker(latlng, letter, options);
};
