import React, { useEffect } from 'react';
import 'aframe';
import 'aframe-look-at-component';

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

const ARNavigation = () => {
    useEffect(() => {
        const loadAFrameGPSEntity = async () => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/aframe-gps-entity-place@1.1.0/dist/aframe-gps-entity-place.min.js';
            script.async = true;
            document.body.appendChild(script);

            return new Promise((resolve) => {
                script.onload = () => resolve();
            });
        };

        let userLocation = null;

        const initializeApp = async () => {
            await loadAFrameGPSEntity();

            const scene = document.querySelector('a-scene');
            const dropdown = document.getElementById('destination-dropdown');
            const fullscreenBtn = document.getElementById('fullscreen-btn');

            // Populate dropdown
            waypoints.forEach(waypoint => {
                const option = document.createElement('option');
                option.value = waypoint.id;
                option.textContent = waypoint.name;
                dropdown.appendChild(option);
            });

            // Add waypoints to the scene
            waypoints.forEach(waypoint => {
                const entity = document.createElement('a-entity');
                entity.setAttribute('gps-entity-place', `latitude: ${waypoint.lat}; longitude: ${waypoint.lon};`);
                entity.setAttribute('geometry', 'primitive: box; height: 2; width: 2; depth: 2');
                entity.setAttribute('material', `color: ${waypoint.color}`);
                entity.setAttribute('scale', '20 20 20');
                entity.setAttribute('look-at', '[gps-camera]');

                const text = document.createElement('a-text');
                text.setAttribute('value', waypoint.name);
                text.setAttribute('look-at', '[gps-camera]');
                text.setAttribute('scale', '1 1 1');
                text.setAttribute('align', 'center');
                text.setAttribute('anchor', 'center');
                text.setAttribute('position', '0 3 0');

                entity.appendChild(text);
                scene.appendChild(entity);
            });

            // Handle destination selection
            dropdown.addEventListener('change', (event) => {
                const selectedId = parseInt(event.target.value);
                const destination = waypoints.find(wp => wp.id === selectedId);
                if (destination && userLocation) {
                    updateNavigation(userLocation, destination);
                }
            });

            // Initialize geolocation
            if ('geolocation' in navigator) {
                navigator.geolocation.watchPosition(
                    (position) => {
                        userLocation = {
                            lat: position.coords.latitude,
                            lon: position.coords.longitude,
                        };
                        console.log('User location updated:', userLocation);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        alert('Unable to get your location. Please enable GPS and try again.');
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                alert('Geolocation is not supported by this browser');
            }

            // Fullscreen button
            fullscreenBtn.addEventListener('click', toggleFullScreen);
        };

        function updateNavigation(start, end) {
            const distance = calculateDistance(start.lat, start.lon, end.lat, end.lon);
            const bearing = calculateBearing(start.lat, start.lon, end.lat, end.lon);
            const direction = getCardinalDirection(bearing);

            const instructionsText = document.getElementById('instructions-text');
            instructionsText.textContent = `Head ${direction} for ${distance.toFixed(0)} meters to reach ${end.name}`;
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

        function toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }

        initializeApp();
    }, []);

    return (
        <div id="app">
            <a-scene
                embedded
                arjs='sourceType: webcam; debugUIEnabled: false; sourceWidth: 1280; sourceHeight: 960; displayWidth: 1280; displayHeight: 960;'
                vr-mode-ui="enabled: false"
            >
                <a-camera gps-camera rotation-reader></a-camera>
            </a-scene>

            <div id="destination-select" className="ui-element">
                <select id="destination-dropdown">
                    <option value="">Select Destination</option>
                </select>
            </div>

            <div id="navigation-instructions" className="ui-element">
                <h3>Navigation Instructions:</h3>
                <p id="instructions-text"></p>
            </div>

            <button id="fullscreen-btn" className="ui-element">Fullscreen</button>
        </div>
    );
};

export default ARNavigation;

