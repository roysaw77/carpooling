// Main Application Entry Point
// MMU Carpool Dashboard

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Initialize data from localStorage
  if (typeof initializeData === 'function') {
    initializeData();
  }

  // Initialize with driver mode by default
  if (typeof switchToDriverMode === 'function') {
    switchToDriverMode();
  }
});

// Debug function to clear all data (can be called from browser console)
window.clearAllData = function () {
  if (confirm('Are you sure you want to clear all ride data? This cannot be undone.')) {
    if (window.Storage) {
      window.Storage.clearAll();
    }

    // Reset global variables
    window.rides = [];
    window.rideRequests = [];
    window.acceptedPassengers = [];

    // Refresh all displays
    if (typeof displayRides === 'function') displayRides();
    if (typeof displayDriverRides === 'function') displayDriverRides();
    if (typeof displayRideRequests === 'function') displayRideRequests();
    if (typeof displayMyPassengers === 'function') displayMyPassengers();

    alert('All data has been cleared!');
  }
};

// Debug function to show current data state
window.showDataState = function () {
  console.log('Current Data State:');
  console.log('Rides:', window.rides);
  console.log('Ride Requests:', window.rideRequests);
  console.log('Accepted Passengers:', window.acceptedPassengers);
  console.log('Current Role:', window.currentUserRole);
};
