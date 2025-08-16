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
    list.innerHTML += `
      <div class="ride">
        <strong>${ride.driver}</strong> → ${ride.destination}<br>
        From: ${ride.start}<br>
        Time: ${new Date(ride.time).toLocaleString()}<br>
        Seats: ${ride.seats}<br>
        <button onclick="requestRide(${index})">Request Ride</button>
      </div>
    `;
  });
}

function requestRide(index) {
  if (index >= 0 && index < rides.length) {
    alert("Request sent to " + rides[index].driver);
    // Here you could add more functionality like removing the seat count
    // or adding the user to a passenger list
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
});

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
