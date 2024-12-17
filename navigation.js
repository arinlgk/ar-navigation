function updateNavigation(position) {
    currentLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };

    if (destination) {
        let distance = calculateDistance(currentLocation, destination);
        let bearing = calculateBearing(currentLocation, destination);
        
        let navInfo = document.getElementById('navigation-info');
        let instructions = getTurnByTurnInstructions(distance, bearing);
        
        navInfo.innerHTML = `
            Navigating to: ${destination.name}<br>
            Distance: ${distance.toFixed(2)} meters<br>
            Direction: ${getBearingDirection(bearing)}<br>
            ${instructions}
        `;

        updateARElements(bearing, distance);

        if (distance < 10) {
            arrivedAtDestination();
        }
    }
}

function getTurnByTurnInstructions(distance, bearing) {
    let instructions = '';
    if (distance > 100) {
        instructions = `Continue ${getBearingDirection(bearing)} for ${Math.round(distance)} meters`;
    } else if (distance > 50) {
        instructions = `Your destination is nearby. Turn ${getBearingDirection(bearing)} and continue for ${Math.round(distance)} meters.`;
    } else {
        instructions = 'You are very close to your destination! Look around for landmarks.';
    }
    return instructions;
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
        0, 0, 0,
        0, 0, -distance
    ];
    path.setAttribute('line', {start: pathPoints.slice(0, 3), end: pathPoints.slice(3)});
    path.setAttribute('visible', true);

    // Update info panel
    const infoPanel = document.querySelector('#info-panel');
    infoPanel.setAttribute('text', {value: `Distance: ${distance.toFixed(2)}m\nDirection: ${getBearingDirection(bearing)}`});
}

