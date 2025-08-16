// Global Variables and State Management
// MMU Carpool Dashboard

// Global state variables
let rides = [];
let rideRequests = [];
let acceptedPassengers = [];
let currentUserRole = null; // 'driver' or 'seater'

// Make variables globally available
window.rides = rides;
window.rideRequests = rideRequests;
window.acceptedPassengers = acceptedPassengers;
window.currentUserRole = currentUserRole;

// Initialize data from localStorage
function initializeData() {
  if (window.Storage && window.Storage.isAvailable()) {
    rides = window.Storage.loadRides();
    rideRequests = window.Storage.loadRideRequests();
    acceptedPassengers = window.Storage.loadAcceptedPassengers() || [];

    // Update global references
    window.rides = rides;
    window.rideRequests = rideRequests;
    window.acceptedPassengers = acceptedPassengers;
  } else {
    console.warn('localStorage not available, data will not persist');
  }
}

// Utility function to format date/time
function formatDateTime(dateString) {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Make functions globally available
window.initializeData = initializeData;
window.formatDateTime = formatDateTime;
