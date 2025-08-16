// Ride Display Functions
// MMU Carpool Dashboard

// Main function to display all rides (legacy function)
function displayRides() {
  const list = document.getElementById('ride-list');
  if (!list) return;

  list.innerHTML = "";

  if (!window.rides || window.rides.length === 0) {
    list.innerHTML = "<p>No rides available at the moment. Publish a ride to get started!</p>";
    return;
  }

  window.rides.forEach((ride, index) => {
    const seatsAvailable = parseInt(ride.seats);
    const requestButtonHtml = seatsAvailable > 0
      ? `<button onclick="requestRide(${index})" class="request-btn">Request Ride (${seatsAvailable} seats left)</button>`
      : `<button disabled class="request-btn-disabled">No Seats Available</button>`;

    // Display price information if available
    const priceInfo = ride.price ? `<br>Price: <span class="price">RM ${ride.price.toFixed(2)}</span>` : '';
    const distanceInfo = ride.distance ? ` (Distance: ${ride.distance} km)` : '';

    // Display simple car information if available
    let carInfoHtml = '';
    if (ride.car) {
      carInfoHtml = `<br>🚗 <strong>${ride.car.name}</strong> - ${ride.car.color} - <strong>${ride.car.plateNumber}</strong>`;
    }

    list.innerHTML += `
      <div class="ride">
        <div class="ride-header">
          <strong>${ride.driver}</strong>
        </div>
        <div class="ride-details">
          Route: ${ride.start} → ${ride.destination}<br>
          Time: ${new Date(ride.time).toLocaleString()}<br>
          Available Seats: ${seatsAvailable}${priceInfo}${distanceInfo}${carInfoHtml}
        </div>
        <div class="ride-actions">
          ${requestButtonHtml}
          <button onclick="editRide(${index})" class="edit-btn">✏️ Edit Ride</button>
          <button onclick="deleteRide(${index})" class="delete-btn">🗑️ Delete</button>
        </div>
      </div>
    `;
  });
}

// Driver Mode: Display only the current user's published rides
function displayDriverRides() {
  const list = document.getElementById('driver-ride-list');
  if (!list) return;

  list.innerHTML = "";

  // For demo purposes, we'll show all rides as if they belong to the current driver
  // In a real app, you'd filter by the actual driver's ID
  const driverRides = window.rides; // In reality: rides.filter(ride => ride.driverId === currentUserId)

  if (driverRides.length === 0) {
    list.innerHTML = "<p>You haven't published any rides yet. Click 'Publish a Ride' to get started!</p>";
    return;
  }

  driverRides.forEach((ride, index) => {
    const seatsAvailable = parseInt(ride.seats);

    // Display price information if available
    const priceInfo = ride.price ? `<br>Price: <span class="price">RM ${ride.price.toFixed(2)}</span>` : '';
    const distanceInfo = ride.distance ? ` (Distance: ${ride.distance} km)` : '';

    // Display simple car information if available
    let carInfoHtml = '';
    if (ride.car) {
      carInfoHtml = `<br>🚗 <strong>${ride.car.name}</strong> - ${ride.car.color} - <strong>${ride.car.plateNumber}</strong>`;
    }

    // Get ride requests for this specific ride
    const rideRequestsForThisRide = window.rideRequests.filter(req => req.rideIndex === index);
    const requestsInfo = rideRequestsForThisRide.length > 0 ?
      `<br><span class="requests-indicator">📋 ${rideRequestsForThisRide.length} request(s) pending</span>` : '';

    list.innerHTML += `
      <div class="ride driver-ride">
        <div class="ride-header">
          <strong>Your Ride</strong>
        </div>
        <div class="ride-details">
          Route: ${ride.start} → ${ride.destination}<br>
          Time: ${new Date(ride.time).toLocaleString()}<br>
          Available Seats: ${seatsAvailable}${priceInfo}${distanceInfo}${carInfoHtml}${requestsInfo}
        </div>
        <div class="ride-actions">
          <button onclick="editRide(${index})" class="edit-btn">✏️ Edit Ride</button>
          <button onclick="deleteRide(${index})" class="delete-btn">🗑️ Delete</button>
        </div>
      </div>
    `;
  });
}

// Seater Mode: Display all available rides that seaters can request
function displayAvailableRides() {
  const list = document.getElementById('seater-ride-list');
  if (!list) return;

  list.innerHTML = "";

  if (!window.rides || window.rides.length === 0) {
    list.innerHTML = "<p>No rides available at the moment. Check back later!</p>";
    return;
  }

  window.rides.forEach((ride, index) => {
    const seatsAvailable = parseInt(ride.seats);
    const requestButtonHtml = seatsAvailable > 0
      ? `<button onclick="requestRide(${index})" class="request-btn">Request Ride (${seatsAvailable} seats left)</button>`
      : `<button disabled class="request-btn-disabled">No Seats Available</button>`;

    // Display price information if available
    const priceInfo = ride.price ? `<br>Price: <span class="price">RM ${ride.price.toFixed(2)}</span>` : '';
    const distanceInfo = ride.distance ? ` (Distance: ${ride.distance} km)` : '';

    // Display simple car information if available
    let carInfoHtml = '';
    if (ride.car) {
      carInfoHtml = `<br>🚗 <strong>${ride.car.name}</strong> - ${ride.car.color} - <strong>${ride.car.plateNumber}</strong>`;
    }

    list.innerHTML += `
      <div class="ride">
        <div class="ride-header">
          <strong>${ride.driver}</strong>
        </div>
        <div class="ride-details">
          Route: ${ride.start} → ${ride.destination}<br>
          Time: ${new Date(ride.time).toLocaleString()}<br>
          Available Seats: ${seatsAvailable}${priceInfo}${distanceInfo}${carInfoHtml}
        </div>
        <div class="ride-actions">
          ${requestButtonHtml}
        </div>
      </div>
    `;
  });
}

// Edit ride function
function editRide(index) {
  if (typeof openEditRidePopup === 'function') {
    openEditRidePopup(index);
  } else {
    alert('Edit functionality not available');
  }
}

// Delete ride function
function deleteRide(index) {
  if (confirm('Are you sure you want to delete this ride?')) {
    window.rides.splice(index, 1);

    // Save updated rides to localStorage
    if (window.Storage) {
      window.Storage.saveRides(window.rides);
    }

    // Refresh displays
    displayRides();
    displayDriverRides();

    alert('Ride deleted successfully!');
  }
}

// Make functions globally available
window.displayRides = displayRides;
window.displayDriverRides = displayDriverRides;
window.displayAvailableRides = displayAvailableRides;
window.editRide = editRide;
window.deleteRide = deleteRide;
