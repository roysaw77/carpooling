// MMU Carpool Dashboard JavaScript

// Global variables
let rides = [];

// Main functions
function publishRide() {
  const driver = document.getElementById('driver').value;
  const start = document.getElementById('start').value;
  const destination = document.getElementById('destination').value;
  const time = document.getElementById('time').value;
  const seats = document.getElementById('seats').value;

  if (!driver || !start || !destination || !time) {
    alert("Please fill in all fields.");
    return;
  }

  const ride = { driver, start, destination, time, seats };
  rides.push(ride);
  displayRides();
  clearForm();
}

function displayRides() {
  const list = document.getElementById('ride-list');
  list.innerHTML = "";

  if (rides.length === 0) {
    list.innerHTML = "<p>No rides available yet. Be the first to publish a ride!</p>";
    return;
  }

  rides.forEach((ride, index) => {
    const seatsAvailable = parseInt(ride.seats);
    const buttonHtml = seatsAvailable > 0
      ? `<button onclick="requestRide(${index})" class="request-btn">Request Ride (${seatsAvailable} seats left)</button>`
      : `<button disabled class="request-btn-disabled">No Seats Available</button>`;

    list.innerHTML += `
      <div class="ride">
        <strong>${ride.driver}</strong> → ${ride.destination}<br>
        From: ${ride.start}<br>
        Time: ${new Date(ride.time).toLocaleString()}<br>
        Available Seats: ${seatsAvailable}<br>
        ${buttonHtml}
      </div>
    `;
  });
}

function requestRide(index) {
  if (index >= 0 && index < rides.length) {
    // Store the selected ride for the request
    window.selectedRideIndex = index;
    window.selectedRide = rides[index];

    // Open the request ride popup
    openRequestPopup();
  }
}

function clearForm() {
  document.getElementById('driver').value = '';
  document.getElementById('start').value = '';
  document.getElementById('destination').value = '';
  document.getElementById('time').value = '';
  document.getElementById('seats').value = '1';
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  displayRides(); // Show initial empty state
  displayRideRequests(); // Show initial requests
});

// Function to display ride requests
function displayRideRequests() {
  const requestsList = document.getElementById('requests-list');
  const requestsSection = document.getElementById('requests-section');

  if (!window.rideRequests || window.rideRequests.length === 0) {
    requestsSection.style.display = 'none';
    return;
  }

  requestsSection.style.display = 'block';
  requestsList.innerHTML = "";

  window.rideRequests.forEach((request, index) => {
    requestsList.innerHTML += `
      <div class="request">
        <div class="request-header">
          <strong>📞 ${request.passengerName}</strong>
          <span class="request-time">${new Date(request.requestTime).toLocaleString()}</span>
        </div>
        <div class="request-details">
          <p><strong>Student ID:</strong> ${request.studentId}</p>
          <p><strong>Contact:</strong> ${request.contactNumber}</p>
          <p><strong>Passengers:</strong> ${request.passengerCount} person(s)</p>
          <p><strong>Pickup Location:</strong> ${request.pickupLocation}</p>
          <p><strong>For Ride:</strong> ${request.driver} → ${request.destination}</p>
          ${request.additionalNotes ? `<p><strong>Notes:</strong> ${request.additionalNotes}</p>` : ''}
        </div>
        <div class="request-actions">
          <button onclick="acceptRequest(${index})" class="btn-accept">✅ Accept</button>
          <button onclick="declineRequest(${index})" class="btn-decline">❌ Decline</button>
        </div>
      </div>
    `;
  });
}

function acceptRequest(index) {
  if (window.rideRequests && window.rideRequests[index]) {
    const request = window.rideRequests[index];
    alert(`Great! You've accepted ${request.passengerName}'s request. Contact them at ${request.contactNumber} to arrange pickup details.`);

    // Remove the request from the list
    window.rideRequests.splice(index, 1);
    displayRideRequests();
  }
}

function declineRequest(index) {
  if (window.rideRequests && window.rideRequests[index]) {
    const request = window.rideRequests[index];

    // Return the seats back to the ride
    const rideIndex = request.rideIndex;
    if (rides[rideIndex]) {
      rides[rideIndex].seats = (parseInt(rides[rideIndex].seats) + request.passengerCount).toString();
      displayRides();
    }

    alert(`Request from ${request.passengerName} has been declined. The seats have been made available again.`);

    // Remove the request from the list
    window.rideRequests.splice(index, 1);
    displayRideRequests();
  }
}

// Utility functions for future enhancements
function validateForm(driver, start, destination, time) {
  const errors = [];

  if (!driver.trim()) errors.push("Driver name is required");
  if (!start.trim()) errors.push("Start location is required");
  if (!destination.trim()) errors.push("Destination is required");
  if (!time) errors.push("Date and time is required");

  return errors;
}

function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Function to add a ride (can be called from popup)
window.addRide = function (ride) {
  rides.push(ride);
  displayRides();
}

// Make functions available globally for popup
window.publishRide = publishRide;
window.displayRides = displayRides;
window.rides = rides;
