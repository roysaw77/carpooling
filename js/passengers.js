// Passenger Management Functions
// MMU Carpool Dashboard

// Display accepted passengers for drivers
function displayMyPassengers() {
  const passengersList = document.getElementById('my-passengers-list');
  const passengersSection = document.getElementById('my-passengers-section');

  if (!passengersList || !passengersSection) return;

  if (!window.acceptedPassengers || window.acceptedPassengers.length === 0) {
    passengersList.innerHTML = '<p class="no-data">No passengers yet. Accept ride requests to see them here!</p>';
    passengersSection.style.display = 'none';
    return;
  }

  passengersSection.style.display = 'block';

  passengersList.innerHTML = window.acceptedPassengers.map((passenger, index) => {
    // Use stored route details if available, otherwise fallback to ride lookup
    const rideDetails = passenger.rideDetails ||
      (window.rides[passenger.rideIndex] ? `${window.rides[passenger.rideIndex].start} → ${window.rides[passenger.rideIndex].destination}` : 'Route not available');

    return `
      <div class="passenger-card">
        <div class="passenger-info">
          <h4>${passenger.passengerName}</h4>
          <p><strong>Student ID:</strong> ${passenger.studentId}</p>
          <p><strong>Contact:</strong> ${passenger.contactNumber}</p>
          <p><strong>Passengers:</strong> ${passenger.passengerCount}</p>
          <p><strong>Route:</strong> ${rideDetails}</p>
          <p><strong>Accepted:</strong> ${window.formatDateTime ? window.formatDateTime(passenger.acceptedAt) : new Date(passenger.acceptedAt).toLocaleDateString()}</p>
        </div>
        <div class="passenger-actions">
          <button onclick="contactPassenger('${passenger.contactNumber}')" class="btn-contact">📞 Contact</button>
          <button onclick="removePassenger(${index})" class="btn-remove">❌ Remove</button>
        </div>
      </div>
    `;
  }).join('');
}

// Contact passenger function
function contactPassenger(contactNumber) {
  alert(`Contact the passenger at: ${contactNumber}`);
}

// Remove passenger function
function removePassenger(index) {
  if (confirm('Are you sure you want to remove this passenger?')) {
    const passenger = window.acceptedPassengers[index];

    // Return seats back to the ride
    const rideIndex = passenger.rideIndex;
    if (window.rides[rideIndex]) {
      window.rides[rideIndex].seats = (parseInt(window.rides[rideIndex].seats) + parseInt(passenger.passengerCount)).toString();

      // Save updated rides
      if (window.Storage) {
        window.Storage.saveRides(window.rides);
      }

      if (typeof displayDriverRides === 'function') displayDriverRides();
    }

    // Remove from accepted passengers
    window.acceptedPassengers.splice(index, 1);

    // Save updated passengers
    if (window.Storage) {
      window.Storage.saveAcceptedPassengers(window.acceptedPassengers);
    }

    displayMyPassengers();
    alert('Passenger removed and seats returned to available rides.');
  }
}

// Accept ride request function
function acceptRequest(index) {
  if (window.rideRequests && window.rideRequests[index]) {
    const request = window.rideRequests[index];
    const ride = window.rides[request.rideIndex];

    // Add to accepted passengers list
    const passenger = {
      passengerName: request.passengerName,
      studentId: request.studentId,
      contactNumber: request.contactNumber,
      passengerCount: request.passengerCount,
      rideIndex: request.rideIndex,
      rideDetails: ride ? `${ride.start} → ${ride.destination}` : 'Route not available',
      driverName: ride ? ride.driver : 'Unknown',
      rideTime: ride ? ride.time : 'Unknown',
      acceptedAt: new Date().toISOString()
    };

    window.acceptedPassengers.push(passenger);

    // Save accepted passengers to localStorage
    if (window.Storage) {
      window.Storage.saveAcceptedPassengers(window.acceptedPassengers);
    }

    alert(`Great! You've accepted ${request.passengerName}'s request. Contact them at ${request.contactNumber} to arrange pickup details.`);

    // Remove the request from the list
    window.rideRequests.splice(index, 1);

    // Save updated requests to localStorage
    if (window.Storage) {
      window.Storage.saveRideRequests(window.rideRequests);
    }

    if (typeof displayRideRequests === 'function') displayRideRequests();
    displayMyPassengers(); // Update passenger display
  }
}

// Decline ride request function
function declineRequest(index) {
  if (window.rideRequests && window.rideRequests[index]) {
    const request = window.rideRequests[index];

    // Return the seats back to the ride
    const rideIndex = request.rideIndex;
    if (window.rides[rideIndex]) {
      window.rides[rideIndex].seats = (parseInt(window.rides[rideIndex].seats) + request.passengerCount).toString();

      // Save updated rides to localStorage
      if (window.Storage) {
        window.Storage.saveRides(window.rides);
      }

      if (typeof displayRides === 'function') displayRides();
      if (typeof displayDriverRides === 'function') displayDriverRides();
    }

    alert(`Request from ${request.passengerName} has been declined. The seats have been made available again.`);

    // Remove the request from the list
    window.rideRequests.splice(index, 1);

    // Save updated requests to localStorage
    if (window.Storage) {
      window.Storage.saveRideRequests(window.rideRequests);
    }

    if (typeof displayRideRequests === 'function') displayRideRequests();
  }
}

// Make functions globally available
window.displayMyPassengers = displayMyPassengers;
window.contactPassenger = contactPassenger;
window.removePassenger = removePassenger;
window.acceptRequest = acceptRequest;
window.declineRequest = declineRequest;
