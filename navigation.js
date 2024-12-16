const locations = [
    { id: 'mainEntrance', name: 'UMPSA Pekan Main Entrance', lat: 3.5424105381833333, lon: 103.42519353920233, info: 'The main entrance to UMPSA Pekan campus.' },
    { id: 'facultyComputing', name: 'Faculty of Computing', lat: 3.5470578908910624, lon: 103.42766713303656, info: 'Home to computer science and IT programs.' },
    { id: 'ditec', name: 'Ditec UMPSA', lat: 3.5444022329295355, lon: 103.43162607338732, info: 'UMPSA\'s center for technological innovation.' },
    { id: 'ftkee', name: 'FTKEE Cafe', lat: 3.5395406456778633, lon: 103.4310681740305, info: 'A popular spot for students to grab a bite.' },
    { id: 'pap', name: 'PAP', lat: 3.539176561005007, lon: 103.42781733683893, info: 'Academic affairs office.' },
    { id: 'dewan', name: 'Dewan Serbaguna', lat: 3.541152253948052, lon: 103.42994164632783, info: 'Multipurpose hall for events and activities.' },
    { id: 'heAndShe', name: 'He & She', lat: 3.5389632623719502, lon: 103.42746000826024, info: 'Campus convenience store.' },
    { id: 'basketballCourt', name: 'KK5 Basketball Court', lat: 3.5382039072479077, lon: 103.42795100526111, info: 'Outdoor basketball court for sports enthusiasts.' },
    { id: 'library', name: 'Library', lat: 3.5427684944699585, lon: 103.43133217957656, info: 'UMPSA\'s main library and study center.' },
    { id: 'healthCentre', name: 'University Health Centre', lat: 3.5487033301435926, lon: 103.43386164772174, info: 'On-campus medical facility for students and staff.' }
];

let currentLocation = null;
let destination = null;
let watchId = null;

AFRAME.registerComponent('navigate-on-click', {
    init: function () {
        let el = this.el;
        el.addEventListener('click', function () {
            let targetName = el.getAttribute('name');
            let targetLocation = locations.find(loc => loc.name === targetName);
            if (targetLocation) {
                startNavigation(targetLocation);
            }
        });
    }
});

function showDestinationList() {
    let list = document.getElementById('destination-list');
    list.innerHTML = '';
    list.style.display = 'block';
    
    locations.forEach(location => {
        let button = document.createElement('button');
        button.textContent = location.name;
        button.onclick = () => startNavigation(location);
        list.appendChild(button);
    });
}

function startNavigation(dest) {
    destination = dest;
    document.getElementById('destination-list').style.display = 'none';
    document.getElementById('choose-destination').style.display = 'none';
    let navInfo = document.getElementById('navigation-info');
    navInfo.style.display = 'block';
    navInfo.innerHTML = `Navigating to: ${destination.name}`;
    
    if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(updateNavigation, handleLocationError, {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
        });
    } else {
        navInfo.innerHTML = "Geolocation is not supported by your browser";
    }
}

function updateNavigation(position) {
    currentLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };

    if (destination) {
        let distance = calculateDistance(currentLocation, destination);
        let bearing = calculateBearing(currentLocation, destination);
        
        let navInfo = document.getElementById('navigation-info');
        navInfo.innerHTML = `
            Navigating to: ${destination.name}<br>
            Distance: ${distance.toFixed(2)} meters<br>
            Direction: ${getBearingDirection(bearing)}
        `;

        updateARElements(bearing, distance);

        if (distance < 10) { // If within 10 meters of destination
            arrivedAtDestination();
        }
    }
}

function calculateDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lon - point1.lon) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

function calculateBearing(point1, point2) {
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const λ1 = point1.lon * Math.PI / 180;
    const λ2 = point2.lon * Math.PI / 180;

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);

    return (θ * 180 / Math.PI + 360) % 360; // in degrees
}

function getBearingDirection(bearing) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(bearing / 45) % 8];
}

function updateARElements(bearing, distance) {
    // Update direction arrow
    const arrow = document.querySelector('#directionArrow');
    arrow.setAttribute('rotation', `0 ${-bearing} 0`);
    arrow.setAttribute('position', `0 ${1.6 + Math.sin(Date.now() / 500) * 0.1} -2`);
    arrow.setAttribute('visible', true);

    // Update navigation path
    const path = document.querySelector('#navigationPath');
    const pathPoints = [
        currentLocation.lon, 0, -currentLocation.lat,
        destination.lon, 0, -destination.lat
    ];
    path.setAttribute('line', {start: pathPoints.slice(0, 3), end: pathPoints.slice(3)});

    // Provide turn-by-turn instructions
    let instructions = '';
    if (distance > 100) {
        instructions = `Continue straight for ${Math.round(distance)} meters`;
    } else if (distance > 50) {
        instructions = 'Your destination is nearby. Keep an eye out for landmarks.';
    } else {
        instructions = 'You are very close to your destination!';
    }

    document.getElementById('navigation-info').innerHTML += `<br>${instructions}`;
}

function arrivedAtDestination() {
    navigator.geolocation.clearWatch(watchId);
    document.getElementById('navigation-info').style.display = 'none';
    document.getElementById('arrival-options').style.display = 'flex';
    document.querySelector('#directionArrow').setAttribute('visible', false);
    document.querySelector('#navigationPath').setAttribute('visible', false);
}

function viewInfo() {
    let infoDiv = document.createElement('div');
    infoDiv.id = 'location-info';
    infoDiv.innerHTML = `
        <h2>${destination.name}</h2>
        <p>${destination.info}</p>
        <button onclick="closeInfo()">Close</button>
    `;
    document.body.appendChild(infoDiv);
}

function closeInfo() {
    document.getElementById('location-info').remove();
}

function endNavigation() {
    destination = null;
    document.getElementById('arrival-options').style.display = 'none';
    document.getElementById('choose-destination').style.display = 'block';
    document.querySelector('#directionArrow').setAttribute('visible', false);
    document.querySelector('#navigationPath').setAttribute('visible', false);
}

function handleLocationError(error) {
    let navInfo = document.getElementById('navigation-info');
    switch(error.code) {
        case error.PERMISSION_DENIED:
            navInfo.innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            navInfo.innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            navInfo.innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            navInfo.innerHTML = "An unknown error occurred.";
            break;
    }
}

