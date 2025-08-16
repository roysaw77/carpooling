// Ride Publishing Functions
// MMU Carpool Dashboard

// Main function to publish a ride
function publishRide() {
  const driver = document.getElementById('driver').value;
  const start = document.getElementById('start').value;
  const destination = document.getElementById('destination').value;
  const time = document.getElementById('time').value;
  const seats = document.getElementById('seats').value;

  // Validate required fields
  if (!driver || !start || !destination || !time) {
    alert("Please fill in all required fields.");
    return;
  }

  const ride = {
    id: Date.now(),
    driver,
    start,
    destination,
    time,
    seats,
    createdAt: new Date().toISOString()
  };

  window.rides.push(ride);

  // Save to localStorage
  if (window.Storage) {
    window.Storage.saveRides(window.rides);
  }

  // Refresh displays
  if (typeof displayRides === 'function') displayRides();
  if (typeof displayDriverRides === 'function') displayDriverRides();

  // Clear form
  clearForm();

  alert("Ride published successfully!");
}

// Clear the publish ride form
function clearForm() {
  document.getElementById('driver').value = '';
  document.getElementById('start').value = '';
  document.getElementById('destination').value = '';
  document.getElementById('time').value = '';
  document.getElementById('seats').value = '1';
}

// Function to add a ride (can be called from popup)
function addRide(ride) {
  // Add unique ID and timestamp if not present
  if (!ride.id) {
    ride.id = Date.now();
  }
  if (!ride.createdAt) {
    ride.createdAt = new Date().toISOString();
  }

  window.rides.push(ride);

  // Save to localStorage
  if (window.Storage) {
    window.Storage.saveRides(window.rides);
  }

  // Refresh displays
  if (typeof displayRides === 'function') displayRides();
  if (typeof displayDriverRides === 'function') displayDriverRides();
}

// Make functions globally available
window.publishRide = publishRide;
window.addRide = addRide;
window.clearForm = clearForm;
