const functions = require('firebase-functions');

exports.showGoogleMapsLocation = functions.https.onRequest((req, res) => {
    const latitude = parseFloat(req.query.latitude);
    const longitude = parseFloat(req.query.longitude);

    if (!latitude || !longitude) {
        return res.status(400).send('Invalid or missing latitude or longitude');
    }

    const mapHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>EV Manufacturing Location</title>
            <style>
                #map {
                    height: 100%;
                }
                html, body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                function initMap() {
                    var location = {lat: ${latitude}, lng: ${longitude}};
                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 12,
                        center: location
                    });
                    var marker = new google.maps.Marker({
                        position: location,
                        map: map
                    });
                }
            </script>
            <script src="https://maps.googleapis.com/maps/api/js?key=&callback=initMap"></script>
            async defer></script>
        </body>
        </html>
    `;

    res.send(mapHTML);
});
