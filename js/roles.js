// Role Management Functions
// MMU Carpool Dashboard

function switchToDriverMode() {
  window.currentUserRole = 'driver';

  // Update button states
  document.getElementById('driver-btn').classList.add('active');
  document.getElementById('seater-btn').classList.remove('active');

  // Show/hide content
  document.getElementById('driver-mode').style.display = 'block';
  document.getElementById('seater-mode').style.display = 'none';

  // Load driver-specific data
  if (typeof displayDriverRides === 'function') displayDriverRides();
  if (typeof displayDriverRequests === 'function') displayDriverRequests();
  if (typeof displayMyPassengers === 'function') displayMyPassengers();
  if (typeof displayRideNeeds === 'function') displayRideNeeds();
}

function switchToSeaterMode() {
  window.currentUserRole = 'seater';

  // Update button states
  document.getElementById('seater-btn').classList.add('active');
  document.getElementById('driver-btn').classList.remove('active');

  // Show/hide content
  document.getElementById('seater-mode').style.display = 'block';
  document.getElementById('driver-mode').style.display = 'none';

  // Load seater-specific data
  if (typeof displayAvailableRides === 'function') displayAvailableRides();
  if (typeof displayMyRequests === 'function') displayMyRequests();
  if (typeof displayMyRideNeeds === 'function') displayMyRideNeeds();
}

// Make functions globally available
window.switchToDriverMode = switchToDriverMode;
window.switchToSeaterMode = switchToSeaterMode;
