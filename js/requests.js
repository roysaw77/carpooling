// Ride Requests Management Functions
// MMU Carpool Dashboard

// Function to request a ride
function requestRide(rideIndex) {
  if (typeof openRideRequestPopup === 'function') {
    openRideRequestPopup(rideIndex);
  } else {
    // Fallback inline request (if popup fails to load)
    const passengerName = prompt("Enter your name:");
    const studentId = prompt("Enter your student ID:");
    const contactNumber = prompt("Enter your contact number:");
    const passengerCount = prompt("How many passengers? (including you):");

    if (!passengerName || !studentId || !contactNumber || !passengerCount) {
      alert("Please provide all required information.");
      return;
    }

    const numPassengers = parseInt(passengerCount);
    if (isNaN(numPassengers) || numPassengers < 1) {
      alert("Please enter a valid number of passengers.");
      return;
    }

    const ride = window.rides[rideIndex];
    const availableSeats = parseInt(ride.seats);

    if (numPassengers > availableSeats) {
      alert(`Sorry, only ${availableSeats} seats are available.`);
      return;
    }

    // Create ride request
    const request = {
      rideIndex: rideIndex,
      passengerName: passengerName,
      studentId: studentId,
      contactNumber: contactNumber,
      passengerCount: numPassengers,
      driver: ride.driver,
      destination: ride.destination,
      requestTime: new Date().toISOString(),
      status: 'pending'
    };

    // Add to requests
    window.rideRequests.push(request);

    // Reduce available seats
    window.rides[rideIndex].seats = (availableSeats - numPassengers).toString();

    // Save to localStorage
    if (window.Storage) {
      window.Storage.saveRideRequests(window.rideRequests);
      window.Storage.saveRides(window.rides);
    }

    // Refresh displays
    if (typeof displayRides === 'function') displayRides();
    if (typeof displayAvailableRides === 'function') displayAvailableRides();
    if (typeof displayRideRequests === 'function') displayRideRequests();

    alert(`Request sent successfully! The driver will review your request.`);
  }
}

// Display ride requests for drivers to accept/reject
function displayRideRequests() {
  const requestsList = document.getElementById('requests-list');
  const requestsSection = document.getElementById('requests-section');

  if (!requestsList || !requestsSection) return;

  if (!window.rideRequests || window.rideRequests.length === 0) {
    requestsSection.style.display = 'none';
    return;
  }

  requestsSection.style.display = 'block';
  requestsList.innerHTML = window.rideRequests.map((request, index) => {
    return `
      <div class="request-item">
        <div class="request-info">
          <h4>${request.passengerName}</h4>
          <p><strong>Student ID:</strong> ${request.studentId}</p>
          <p><strong>Contact:</strong> ${request.contactNumber}</p>
          <p><strong>Passengers:</strong> ${request.passengerCount}</p>
          <p><strong>Destination:</strong> ${request.destination}</p>
          <p><strong>Requested:</strong> ${window.formatDateTime ? window.formatDateTime(request.requestTime) : new Date(request.requestTime).toLocaleDateString()}</p>
        </div>
        <div class="request-actions">
          <button onclick="acceptRequest(${index})" class="btn-accept">✅ Accept</button>
          <button onclick="declineRequest(${index})" class="btn-reject">❌ Decline</button>
        </div>
      </div>
    `;
  }).join('');
}

// Display driver requests (for driver mode)
function displayDriverRequests() {
  const requestsList = document.getElementById('driver-requests-list');
  const requestsSection = document.getElementById('driver-requests-section');

  if (!requestsList || !requestsSection) return;

  if (!window.rideRequests || window.rideRequests.length === 0) {
    requestsSection.style.display = 'none';
    return;
  }

  requestsSection.style.display = 'block';
  requestsList.innerHTML = window.rideRequests.map((request, index) => {
    return `
      <div class="request-item">
        <div class="request-info">
          <h4>${request.passengerName}</h4>
          <p><strong>Student ID:</strong> ${request.studentId}</p>
          <p><strong>Contact:</strong> ${request.contactNumber}</p>
          <p><strong>Passengers:</strong> ${request.passengerCount}</p>
          <p><strong>Destination:</strong> ${request.destination}</p>
          <p><strong>Requested:</strong> ${window.formatDateTime ? window.formatDateTime(request.requestTime) : new Date(request.requestTime).toLocaleDateString()}</p>
        </div>
        <div class="request-actions">
          <button onclick="acceptRequest(${index})" class="btn-accept">✅ Accept</button>
          <button onclick="declineRequest(${index})" class="btn-reject">❌ Decline</button>
        </div>
      </div>
    `;
  }).join('');
}

// Display user's own ride requests (for seater mode)
function displayMyRequests() {
  const requestsList = document.getElementById('my-requests-list');
  const requestsSection = document.getElementById('my-requests-section');

  if (!requestsList || !requestsSection) return;

  // For demo purposes, show all requests as user's own
  // In a real app, you'd filter by the actual user's ID
  const myRequests = window.rideRequests; // In reality: rideRequests.filter(req => req.userId === currentUserId)

  if (!myRequests || myRequests.length === 0) {
    requestsSection.style.display = 'none';
    return;
  }

  requestsSection.style.display = 'block';
  requestsList.innerHTML = myRequests.map((request, index) => {
    const statusText = request.status === 'accepted' ? '✅ Accepted' :
      request.status === 'declined' ? '❌ Declined' : '⏳ Pending';

    return `
      <div class="request-item my-request ${request.status}">
        <div class="request-info">
          <h4>Request to ${request.driver}</h4>
          <p><strong>Destination:</strong> ${request.destination}</p>
          <p><strong>Passengers:</strong> ${request.passengerCount}</p>
          <p><strong>Contact:</strong> ${request.contactNumber}</p>
          <p><strong>Status:</strong> <span class="request-status ${request.status}">${statusText}</span></p>
          <p><strong>Requested:</strong> ${window.formatDateTime ? window.formatDateTime(request.requestTime) : new Date(request.requestTime).toLocaleDateString()}</p>
        </div>
      </div>
    `;
  }).join('');
}

// Make functions globally available
window.requestRide = requestRide;
window.displayRideRequests = displayRideRequests;
window.displayDriverRequests = displayDriverRequests;
window.displayMyRequests = displayMyRequests;
