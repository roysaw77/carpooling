// Local Storage Utility for MMU Carpool Dashboard

// Storage keys
const STORAGE_KEYS = {
  RIDES: 'mmu_carpool_rides',
  RIDE_REQUESTS: 'mmu_carpool_ride_requests',
  ACCEPTED_PASSENGERS: 'mmu_carpool_accepted_passengers'
};

// Local Storage Functions
const Storage = {
  // Save rides to localStorage
  saveRides: function (rides) {
    try {
      localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
    } catch (error) {
      console.error('Error saving rides to localStorage:', error);
    }
  },

  // Load rides from localStorage
  loadRides: function () {
    try {
      const savedRides = localStorage.getItem(STORAGE_KEYS.RIDES);
      return savedRides ? JSON.parse(savedRides) : [];
    } catch (error) {
      console.error('Error loading rides from localStorage:', error);
      return [];
    }
  },

  // Save ride requests to localStorage
  saveRideRequests: function (requests) {
    try {
      localStorage.setItem(STORAGE_KEYS.RIDE_REQUESTS, JSON.stringify(requests));
    } catch (error) {
      console.error('Error saving ride requests to localStorage:', error);
    }
  },

  // Load ride requests from localStorage
  loadRideRequests: function () {
    try {
      const savedRequests = localStorage.getItem(STORAGE_KEYS.RIDE_REQUESTS);
      return savedRequests ? JSON.parse(savedRequests) : [];
    } catch (error) {
      console.error('Error loading ride requests from localStorage:', error);
      return [];
    }
  },

  // Save accepted passengers to localStorage
  saveAcceptedPassengers: function (passengers) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCEPTED_PASSENGERS, JSON.stringify(passengers));
    } catch (error) {
      console.error('Error saving accepted passengers to localStorage:', error);
    }
  },

  // Load accepted passengers from localStorage
  loadAcceptedPassengers: function () {
    try {
      const savedPassengers = localStorage.getItem(STORAGE_KEYS.ACCEPTED_PASSENGERS);
      return savedPassengers ? JSON.parse(savedPassengers) : [];
    } catch (error) {
      console.error('Error loading accepted passengers from localStorage:', error);
      return [];
    }
  },

  // Clear all stored data (useful for debugging or reset)
  clearAll: function () {
    try {
      localStorage.removeItem(STORAGE_KEYS.RIDES);
      localStorage.removeItem(STORAGE_KEYS.RIDE_REQUESTS);
      localStorage.removeItem(STORAGE_KEYS.ACCEPTED_PASSENGERS);
      console.log('All carpool data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Check if localStorage is available
  isAvailable: function () {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }
};

// Make Storage available globally
window.Storage = Storage;
