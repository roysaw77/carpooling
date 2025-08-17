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

// Popup functionality for the publish ride form
function openPopup() {
  // Load the popup content if it doesn't exist
  if (!document.getElementById('popup-overlay')) {
    loadPopupForm();
  } else {
    showPopup();
  }
}

function showPopup() {
  const overlay = document.getElementById('popup-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closePopup() {
  const overlay = document.getElementById('popup-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
  }
}

function loadPopupForm() {
  fetch('forms/publish-ride.html')
    .then(response => response.text())
    .then(html => {
      // Extract only the popup content from the loaded HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const popupOverlay = doc.getElementById('popup-overlay');

      if (popupOverlay) {
        document.body.appendChild(popupOverlay);

        // Initialize location dropdowns
        initializeLocationDropdowns();

        showPopup();

        // Add event listener for clicking outside the popup to close it
        popupOverlay.addEventListener('click', function (e) {
          if (e.target === popupOverlay) {
            closePopup();
          }
        });

        // Add escape key listener
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            closePopup();
          }
        });
      }
    })
    .catch(error => {
      console.error('Error loading popup form:', error);
      alert('Error loading the publish form. Please try again.');
    });
}

// Enhanced publish ride function for popup
function publishRideFromPopup() {
  const driver = document.getElementById('driver').value;
  const startId = document.getElementById('start').value;
  const destinationId = document.getElementById('destination').value;
  const time = document.getElementById('time').value;
  const seats = document.getElementById('seats').value;

  // Get car information
  const carName = document.getElementById('car-name').value;
  const carColor = document.getElementById('car-color').value;
  const plateNumber = document.getElementById('plate-number').value;

  // Validate required fields
  if (!driver || !startId || !destinationId || !time || !carName || !carColor || !plateNumber) {
    alert("Please fill in all required fields.");
    return;
  }

  // Get location names from IDs
  let startName = startId;
  let destinationName = destinationId;
  let price = null;
  let distance = null;

  if (window.LocationService) {
    const startLocation = window.LocationService.getLocationById(startId);
    const destinationLocation = window.LocationService.getLocationById(destinationId);
    startName = startLocation ? startLocation.name : startId;
    destinationName = destinationLocation ? destinationLocation.name : destinationId;

    // Calculate price and distance
    const tripInfo = window.LocationService.getTripInfo(startId, destinationId);
    price = tripInfo.price;
    distance = tripInfo.distance;
  }

  const ride = {
    id: Date.now(),
    driver,
    start: startName,
    destination: destinationName,
    startId: parseInt(startId),
    destinationId: parseInt(destinationId),
    time,
    seats,
    price: price,
    distance: distance,
    car: {
      name: carName,
      color: carColor,
      plateNumber: plateNumber
    },
    createdAt: new Date().toISOString()
  };

  // Add to rides array
  if (!window.rides) {
    window.rides = [];
  }
  window.rides.push(ride);

  // Save to localStorage
  if (window.Storage) {
    window.Storage.saveRides(window.rides);
  }

  // Refresh displays
  if (typeof displayRides === 'function') displayRides();
  if (typeof displayDriverRides === 'function') displayDriverRides();

  // Clear form and close popup
  clearFormFields();
  closePopup();

  alert("Ride published successfully!");
}

function clearFormFields() {
  const form = document.getElementById('ride-form');
  if (form) {
    form.reset();
  }

  // Hide price display
  const priceDisplay = document.getElementById('price-display');
  if (priceDisplay) {
    priceDisplay.style.display = 'none';
  }
}

// Location and Price Management Functions
function initializeLocationDropdowns() {
  if (window.LocationService) {
    const locationOptions = window.LocationService.generateLocationOptions();

    // Populate start location dropdown
    const startSelect = document.getElementById('start');
    if (startSelect) {
      startSelect.innerHTML = locationOptions;
      startSelect.addEventListener('change', updatePriceDisplay);
    }

    // Populate destination dropdown
    const destinationSelect = document.getElementById('destination');
    if (destinationSelect) {
      destinationSelect.innerHTML = locationOptions;
      destinationSelect.addEventListener('change', updatePriceDisplay);
    }
  }
}

function updatePriceDisplay() {
  const startId = document.getElementById('start')?.value;
  const destinationId = document.getElementById('destination')?.value;
  const priceDisplay = document.getElementById('price-display');
  const priceAmount = document.getElementById('price-amount');
  const priceBreakdown = document.getElementById('price-breakdown');

  if (!startId || !destinationId || !window.LocationService) {
    if (priceDisplay) priceDisplay.style.display = 'none';
    return;
  }

  // Validate trip
  const validation = window.LocationService.validateTrip(startId, destinationId);
  if (!validation.valid) {
    if (priceDisplay) priceDisplay.style.display = 'none';
    return;
  }

  // Calculate and display price
  const tripInfo = window.LocationService.getTripInfo(startId, destinationId);
  if (priceAmount) priceAmount.textContent = `RM ${tripInfo.price.toFixed(2)}`;
  if (priceBreakdown) {
    priceBreakdown.textContent = `Base: RM ${tripInfo.priceBreakdown.basePrice.toFixed(2)} + Distance (${tripInfo.distance}km): RM ${tripInfo.priceBreakdown.distanceCharge.toFixed(2)}`;
  }
  if (priceDisplay) priceDisplay.style.display = 'block';
}

// Make popup functions globally available
window.openPopup = openPopup;
window.closePopup = closePopup;
window.publishRideFromPopup = publishRideFromPopup;
