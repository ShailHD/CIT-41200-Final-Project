let map;
let currentMarkers = []; // To keep track of all markers

const locations = {
    ford: {lat: 19.6431, lng: -99.2151}, // Cuautitlán Assembly, Mexico
    hyundai: {lat: 35.5384, lng: 129.3114}, // Ulsan, South Korea
    kia: {lat: 37.2378, lng: 127.080}, // Hwasung, South Korea
    tesla: {lat: 37.5483, lng: -121.9886} // Fremont, California
};

const qualifications = {
    ford: "YOUR EV DOES NOT QUALIFY AS ITS CRITICAL MINERALS ARE SOURCED FROM FOREIGN ENTITY OF CONCERN.",
    hyundai: "YOUR EV QUALIFIES for $7500 tax credit.",
    kia: "YOUR EV PARTIALLY QUALIFIES, further review needed.",
    tesla: "YOUR EV DOES NOT QUALIFY AS ITS CRITICAL MINERALS ARE SOURCED FROM FOREIGN ENTITY OF CONCERN."
};

const carImages = {
    ford: 'js/ford.png',
    hyundai: 'js/hyundai.png',
    kia: 'js/kia.png',
    tesla: 'js/tesla.png'
};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: {lat: 37.0902, lng: -95.7129} // Center of USA
    });
}

function updateMap() {
    const selectedVehicle = document.getElementById('vehicleSelect').value;
    clearMarkers(); // Clear existing markers before adding new ones

    if (selectedVehicle) {
        const location = locations[selectedVehicle];
        map.setCenter(location);

        // Standard Google Maps Marker (Red Pinpoint)
        const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: selectedVehicle // Tooltip for the marker
        });
        currentMarkers.push(marker);

        // Additional marker for displaying the car image
        const image = {
            url: carImages[selectedVehicle],
            scaledSize: new google.maps.Size(80, 50) // Adjusts the size of the car image
        };

        const imageMarker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng - 0.01), // Slightly offset for visibility
            map: map,
            icon: image,
            title: selectedVehicle // Optional: tooltip for the image
        });
        currentMarkers.push(imageMarker);

        document.getElementById('qualificationMessage').textContent = qualifications[selectedVehicle];
        document.getElementById('qualificationMessage').style.color = (selectedVehicle === 'hyundai') ? 'green' : 'red';
    } else {
        document.getElementById('qualificationMessage').textContent = 'Please select a vehicle.';
    }
}

function clearMarkers() {
    for (let marker of currentMarkers) {
        marker.setMap(null);
    }
    currentMarkers = [];
}

document.addEventListener('DOMContentLoaded', initMap);
document.getElementById('vehicleSelect').addEventListener('change', updateMap); // Assuming there is a select element with this id
