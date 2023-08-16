/* campground = JSON.parse(campground); */ // VS Code not like ejs files

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 12, // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker(
    {
        color: 'black'
    })
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({
            offset: 25
        })
        .setHTML(
            `<h5>${campground.title}</h5>
            <p>${campground.location}</p>`
        )
    )
    .addTo(map);