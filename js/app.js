// MMU Carpool Dashboard JavaScript

// Global variables
let rides = [];
let rideRequests = [];

// Initialize data from localStorage
function initializeData() {
  if (window.Storage && window.Storage.isAvailable()) {
    rides = window.Storage.loadRides();
    rideRequests = window.Storage.loadRideRequests();
    window.rideRequests = rideRequests; // Make it globally accessible
  } else {
    console.warn('localStorage not available, data will not persist');
  }
}

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

  const ride = {
    id: Date.now(), // Add unique ID for better tracking
    driver,
    start,
    destination,
    time,
    seats,
    createdAt: new Date().toISOString()
  };

  rides.push(ride);

  // Save to localStorage
  if (window.Storage) {
    window.Storage.saveRides(rides);
  }

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

function requestRide(index) {
  if (index >= 0 && index < rides.length) {
    // Store the selected ride for the request
    window.selectedRideIndex = index;
    window.selectedRide = rides[index];

    // Open the request ride popup
    openRequestPopup();
  }
}

function editRide(index) {
  if (index >= 0 && index < rides.length) {
    // Store the ride being edited
    window.editingRideIndex = index;
    window.editingRide = rides[index];

    // Open the edit ride popup
    openEditRidePopup();
  }
}

function deleteRide(index) {
  if (index >= 0 && index < rides.length) {
    const ride = rides[index];
    const confirmDelete = confirm(`Are you sure you want to delete the ride from ${ride.start} to ${ride.destination}?`);

    if (confirmDelete) {
      // Remove any related ride requests
      if (rideRequests) {
        rideRequests = rideRequests.filter(request => request.rideIndex !== index);

        // Update ride indices for remaining requests
        rideRequests.forEach(request => {
          if (request.rideIndex > index) {
            request.rideIndex--;
          }
        });

        // Save updated requests to localStorage
        if (window.Storage) {
          window.Storage.saveRideRequests(rideRequests);
        }

        displayRideRequests();
      }

      // Remove the ride
      rides.splice(index, 1);

      // Save updated rides to localStorage
      if (window.Storage) {
        window.Storage.saveRides(rides);
      }

      displayRides();

      alert('Ride deleted successfully!');
    }
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
  initializeData(); // Load data from localStorage
  displayRides(); // Show rides (loaded or empty state)
  displayRideRequests(); // Show ride requests
});

// Function to display ride requests
function displayRideRequests() {
  const requestsList = document.getElementById('requests-list');
  const requestsSection = document.getElementById('requests-section');

  if (!rideRequests || rideRequests.length === 0) {
    requestsSection.style.display = 'none';
    return;
  }

  requestsSection.style.display = 'block';
  requestsList.innerHTML = "";

  rideRequests.forEach((request, index) => {
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
  if (rideRequests && rideRequests[index]) {
    const request = rideRequests[index];
    alert(`Great! You've accepted ${request.passengerName}'s request. Contact them at ${request.contactNumber} to arrange pickup details.`);

    // Remove the request from the list
    rideRequests.splice(index, 1);

    // Save updated requests to localStorage
    if (window.Storage) {
      window.Storage.saveRideRequests(rideRequests);
    }

    displayRideRequests();
  }
}

function declineRequest(index) {
  if (rideRequests && rideRequests[index]) {
    const request = rideRequests[index];

    // Return the seats back to the ride
    const rideIndex = request.rideIndex;
    if (rides[rideIndex]) {
      rides[rideIndex].seats = (parseInt(rides[rideIndex].seats) + request.passengerCount).toString();

      // Save updated rides to localStorage
      if (window.Storage) {
        window.Storage.saveRides(rides);
      }

      displayRides();
    }

    alert(`Request from ${request.passengerName} has been declined. The seats have been made available again.`);

    // Remove the request from the list
    rideRequests.splice(index, 1);

    // Save updated requests to localStorage
    if (window.Storage) {
      window.Storage.saveRideRequests(rideRequests);
    }

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
  // Add unique ID and timestamp if not present
  if (!ride.id) {
    ride.id = Date.now();
  }
  if (!ride.createdAt) {
    ride.createdAt = new Date().toISOString();
  }

  rides.push(ride);

  // Save to localStorage
  if (window.Storage) {
    window.Storage.saveRides(rides);
  }

  displayRides();
}

// Make functions and data available globally for popup
window.publishRide = publishRide;
window.displayRides = displayRides;
window.displayRideRequests = displayRideRequests;
window.rides = rides;
window.rideRequests = rideRequests;

// Debug function to clear all data (can be called from browser console)
window.clearAllData = function () {
  if (confirm('Are you sure you want to clear all ride data? This cannot be undone.')) {
    if (window.Storage) {
      window.Storage.clearAll();
    }
    rides = [];
    rideRequests = [];
    window.rideRequests = rideRequests;
    displayRides();
    displayRideRequests();
    alert('All data has been cleared!');
  }
};
