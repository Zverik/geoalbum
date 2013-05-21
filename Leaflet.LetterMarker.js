// Letter marker plugin for Leaflet. Written by Ilya Zverev. Licensed WTFPL.

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
