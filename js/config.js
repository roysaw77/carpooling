// Configuration file for MMU Carpool Dashboard

const CONFIG = {
  // App settings
  APP_NAME: "MMU Carpool Dashboard",
  VERSION: "1.0.0",

  // UI settings
  MAX_SEATS: 4,
  MIN_SEATS: 1,

  // Time settings
  TIME_FORMAT: "en-US",
  DATE_OPTIONS: {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  },

  // Validation settings
  MIN_DRIVER_NAME_LENGTH: 2,
  MIN_LOCATION_LENGTH: 3,

  // Messages
  MESSAGES: {
    EMPTY_RIDES: "No rides available yet. Be the first to publish a ride!",
    REQUEST_SENT: "Request sent to",
    FILL_ALL_FIELDS: "Please fill in all fields.",
    INVALID_INPUT: "Please check your input and try again."
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
