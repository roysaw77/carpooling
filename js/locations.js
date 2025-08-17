// Cyberjaya Locations Configuration
// Locations are arranged in order along main routes for distance calculation

const CYBERJAYA_LOCATIONS = [
  // Main route from North to South
  { id: 0, name: "MMU Main Campus", area: "University" },
  { id: 1, name: "MMU Faculty of Engineering", area: "University" },
  { id: 2, name: "MMU Hostel Complex", area: "University" },
  { id: 3, name: "Cyberjaya City Centre", area: "Commercial" },
  { id: 4, name: "Shaftsbury Mall", area: "Commercial" },
  { id: 5, name: "Tamarind Square", area: "Commercial" },
  { id: 6, name: "Cyberjaya Transport Hub", area: "Transport" },
  { id: 7, name: "Lime Blue Cyberjaya", area: "Residential" },
  { id: 8, name: "DPulze Shopping Centre", area: "Commercial" },
  { id: 9, name: "Cyber Heights Villa", area: "Residential" },
  { id: 10, name: "Cyberia SmartHomes", area: "Residential" },
  { id: 11, name: "Putrajaya Sentral", area: "Transport" },
  { id: 12, name: "IOI City Mall", area: "Commercial" },
];

// Pricing configuration
const PRICING_CONFIG = {
  basePrice: 1.00,          // Base price in RM
  pricePerKm: 0.20,         // Price per kilometer
  maxPrice: 15.00           // Maximum price cap
};

// Location and Pricing Functions
const LocationService = {
  // Get all locations grouped by area
  getLocationsByArea: function () {
    const grouped = {};
    CYBERJAYA_LOCATIONS.forEach(location => {
      if (!grouped[location.area]) {
        grouped[location.area] = [];
      }
      grouped[location.area].push(location);
    });
    return grouped;
  },

  // Get location by ID
  getLocationById: function (id) {
    return CYBERJAYA_LOCATIONS.find(location => location.id === parseInt(id));
  },

  // Get location by name
  getLocationByName: function (name) {
    return CYBERJAYA_LOCATIONS.find(location => location.name === name);
  },

  // Calculate distance between two locations using two-pointer approach
  calculateDistance: function (startId, endId) {
    const start = parseInt(startId);
    const end = parseInt(endId);

    // Two-pointer approach: calculate absolute difference between indices
    return Math.abs(end - start);
  },

  // Calculate price based on distance using two-pointer approach
  calculatePrice: function (startId, endId) {
    const distance = this.calculateDistance(startId, endId);

    // Base calculation: base price + (distance * price per km)
    let price = PRICING_CONFIG.basePrice + (distance * PRICING_CONFIG.pricePerKm);

    // Apply maximum price cap
    price = Math.min(price, PRICING_CONFIG.maxPrice);

    // Round to 2 decimal places
    return Math.round(price * 100) / 100;
  },

  // Get detailed trip information
  getTripInfo: function (startId, endId) {
    const startLocation = this.getLocationById(startId);
    const endLocation = this.getLocationById(endId);
    const distance = this.calculateDistance(startId, endId);
    const price = this.calculatePrice(startId, endId);

    return {
      start: startLocation,
      end: endLocation,
      distance: distance,
      price: price,
      priceBreakdown: {
        basePrice: PRICING_CONFIG.basePrice,
        distanceCharge: distance * PRICING_CONFIG.pricePerKm,
        finalPrice: price
      }
    };
  },

  // Generate options HTML for select elements
  generateLocationOptions: function () {
    const grouped = this.getLocationsByArea();
    let html = '<option value="">Select a location</option>';

    Object.keys(grouped).forEach(area => {
      html += `<optgroup label="${area}">`;
      grouped[area].forEach(location => {
        html += `<option value="${location.id}">${location.name}</option>`;
      });
      html += '</optgroup>';
    });

    return html;
  },

  // Validate if two locations are different
  validateTrip: function (startId, endId) {
    if (!startId || !endId) {
      return { valid: false, message: "Please select both start and destination locations." };
    }

    if (startId === endId) {
      return { valid: false, message: "Start and destination locations must be different." };
    }

    return { valid: true, message: "" };
  }
};

// Make LocationService available globally
window.LocationService = LocationService;
window.CYBERJAYA_LOCATIONS = CYBERJAYA_LOCATIONS;
