# GeoAlbum

So. You've got a hundred photos and a GPS trace, and you want to make browsing those photos comfortable for your readers.
Here is the solution. Make thumbnails for all photos and make an html file like this:

```html
<title>Georeferenced photos</title>
<link href="geoalbum.css" rel="stylesheet" type="text/css">
<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.5.1/leaflet.css" />
<script src="http://cdn.leafletjs.com/leaflet-0.5.1/leaflet.js"></script>
<script src="geoalbum.js"></script>

<div><h1>Opening slide</h1>
<p>Hello and welcome to my photo album!</p>
<p>Change pages by pressing arrow buttons on keyboard, or by clicking relevant links on top and bottom.
The map to the right shows page locations, you can click on numbers to open a page for that location.
All images can be opened in bigger size by clicking on them.</p>
</div>

<div><h1>The first photo</h1>
<div lat="60.667533" lon="30.03332"><a href="01a.jpg"><img src="01a-t.jpg"></a></div>
<p>This is first two photos I took on my trip.</p>
<div lat="60.667636" lon="30.033235"><a href="01b.jpg"><img src="01b-t.jpg"></a></div>
</div>

<div>...</div>
```

Note `geoalbum.js` and `leaflet.js` included. Those will make a beautiful photo album with a map and slides from this
simple page. You can check out an [example album](http://textual.ru/lk130518/), for which this library was
written. Thanks to Tom MacWright for inspiration. The source is released under WTFPL, so feel free to alter
it in any way.

# Leaflet.LetterMarker

The album needed a special kind of marker: the one with letters on it. So I wrote a plugin that slightly
modifies leaflet's Marker class. Just include `Leaflet.LetterMarker.js` script in your page and create
markers like that:

    L.letterMarker([12.34, 56.78], 'A', { color: 'blue' }).addTo(map);

This plugin is also licensed WTFPL.

