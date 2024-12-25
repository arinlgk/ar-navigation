const waypoints = [
    { id: 1, name: 'UMPSA Main Entrance', lat: 3.5424105381833333, lon: 103.42519353920233, color: 'red' },
    { id: 2, name: 'Faculty of Computing', lat: 3.5470578908910624, lon: 103.42766713303656, color: 'green' },
    { id: 3, name: 'Ditec UMPSA', lat: 3.5444022329295355, lon: 103.43162607338732, color: 'blue' },
    { id: 4, name: 'FTKEE Cafe', lat: 3.5395406456778633, lon: 103.4310681740305, color: 'yellow' },
    { id: 5, name: 'PAP', lat: 3.539176561005007, lon: 103.42781733683893, color: 'orange' },
    { id: 6, name: 'Dewan Serbaguna', lat: 3.541152253948052, lon: 103.42994164632783, color: 'purple' },
    { id: 7, name: 'He & She', lat: 3.5389632623719502, lon: 103.42746000826024, color: 'pink' },
    { id: 8, name: 'KK5 Basketball Court', lat: 3.5382039072479077, lon: 103.42795100526111, color: 'cyan' },
    { id: 9, name: 'Library', lat: 3.5427684944699585, lon: 103.43133217957656, color: 'brown' },
    { id: 10, name: 'University Health Centre', lat: 3.5487033301435926, lon: 103.43386164772174, color: 'gray' },
];

function ARNavigation() {
    const [isNavigating, setIsNavigating] = React.useState(false);
    const [selectedDestination, setSelectedDestination] = React.useState(null);
    const [userLocation, setUserLocation] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [navigationInfo, setNavigationInfo] = React.useState(null);

    React.useEffect(() => {
        if ('geolocation' in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setError('Unable to get your location. Please enable GPS and try again.');
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            setError('Geolocation is not supported by your browser');
        }
    }, []);

    React.useEffect(() => {
        if (isNavigating && selectedDestination && userLocation) {
            updateNavigation();
        }
    }, [isNavigating, selectedDestination, userLocation]);

    function startNavigation() {
        if (selectedDestination && userLocation) {
            setIsNavigating(true);
            setError(null);
        } else {
            setError('Please select a destination and ensure your location is available.');
        }
    }

    function resetNavigation() {
        setIsNavigating(false);
        setSelectedDestination(null);
        setNavigationInfo(null);
        clearARScene();
    }

    function updateNavigation() {
        const destination = waypoints.find(wp => wp.id === selectedDestination);
        if (destination) {
            const distance = calculateDistance(
                userLocation.lat, userLocation.lon,
                destination.lat, destination.lon
            );
            const bearing = calculateBearing(
                userLocation.lat, userLocation.lon,
                destination.lat, destination.lon
            );
            const direction = getCardinalDirection(bearing);

            setNavigationInfo({
                destinationName: destination.name,
                distance: distance.toFixed(0),
                direction: direction
            });

            updateARScene(destination);
        }
    }

    function updateARScene(destination) {
        clearARScene();

        const scene = document.querySelector('a-scene');
        const destinationEntity = document.createElement('a-entity');
        destinationEntity.setAttribute('gps-entity-place', `latitude: ${destination.lat}; longitude: ${destination.lon};`);
        destinationEntity.setAttribute('geometry', 'primitive: box');
        destinationEntity.setAttribute('material', `color: ${destination.color}`);
        destinationEntity.setAttribute('scale', '20 20 20');
        destinationEntity.setAttribute('look-at', '[gps-camera]');

        const text = document.createElement('a-text');
        text.setAttribute('value', destination.name);
        text.setAttribute('look-at', '[gps-camera]');
        text.setAttribute('scale', '50 50 50');
        text.setAttribute('align', 'center');
        text.setAttribute('position', '0 30 0');

        destinationEntity.appendChild(text);
        scene.appendChild(destinationEntity);
    }

    function clearARScene() {
        const scene = document.querySelector('a-scene');
        while (scene.firstChild) {
            scene.removeChild(scene.firstChild);
        }
        const camera = document.createElement('a-camera');
        camera.setAttribute('gps-camera', '');
        camera.setAttribute('rotation-reader', '');
        scene.appendChild(camera);
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    function calculateBearing(lat1, lon1, lat2, lon2) {
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                  Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        const θ = Math.atan2(y, x);
        return (θ * 180 / Math.PI + 360) % 360; // Bearing in degrees
    }

    function getCardinalDirection(bearing) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(bearing / 45) % 8];
    }

    return (
        <div>
            <div id="ui-overlay" className={isNavigating ? 'hidden' : ''}>
                <h1>UMP Pekan AR Navigation</h1>
                <select
                    value={selectedDestination || ''}
                    onChange={(e) => setSelectedDestination(Number(e.target.value))}
                >
                    <option value="">Select Destination</option>
                    {waypoints.map(wp => (
                        <option key={wp.id} value={wp.id}>{wp.name}</option>
                    ))}
                </select>
                <button onClick={startNavigation}>Start Navigation</button>
                {error && <div id="error-message">{error}</div>}
            </div>

            {isNavigating && (
                <button id="reset-button" onClick={resetNavigation}>Reset</button>
            )}

            {navigationInfo && (
                <div id="navigation-info">
                    <strong>Destination:</strong> {navigationInfo.destinationName}<br />
                    <strong>Distance:</strong> {navigationInfo.distance} meters<br />
                    <strong>Direction:</strong> {navigationInfo.direction}
                </div>
            )}

            <a-scene
                vr-mode-ui="enabled: false"
                embedded
                arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
            >
                <a-camera gps-camera rotation-reader></a-camera>
            </a-scene>
        </div>
    );
}

ReactDOM.render(<ARNavigation />, document.getElementById('root'));

