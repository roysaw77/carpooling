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
      alert('Error loading the form. Please try again.');
    });
}

// Enhanced publish ride function for popup
function publishRideFromPopup() {
  const driver = document.getElementById('driver').value;
  const startId = document.getElementById('start').value;
  const destinationId = document.getElementById('destination').value;
  const time = document.getElementById('time').value;
  const seats = document.getElementById('seats').value;

  // Get simple car information
  const carName = document.getElementById('car-name').value;
  const carColor = document.getElementById('car-color').value;
  const plateNumber = document.getElementById('plate-number').value;

  if (!driver || !startId || !destinationId || !time || !carName || !carColor || !plateNumber) {
    alert("Please fill in all fields including car information.");
    return;
  }

  // Validate trip
  if (window.LocationService) {
    const validation = window.LocationService.validateTrip(startId, destinationId);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
  }

  // Create simple car information object
  const carInfo = {
    name: carName.trim(),
    color: carColor,
    plateNumber: plateNumber.trim().toUpperCase()
  };

  // Get location names and calculate price
  let ride = {
    driver,
    start: startId,
    destination: destinationId,
    time,
    seats,
    car: carInfo
  };

  if (window.LocationService) {
    const startLocation = window.LocationService.getLocationById(startId);
    const destinationLocation = window.LocationService.getLocationById(destinationId);
    const tripInfo = window.LocationService.getTripInfo(startId, destinationId);

    ride = {
      id: Date.now(),
      driver,
      start: startLocation ? startLocation.name : startId,
      destination: destinationLocation ? destinationLocation.name : destinationId,
      startId: parseInt(startId),
      destinationId: parseInt(destinationId),
      time,
      seats,
      price: tripInfo.price,
      distance: tripInfo.distance,
      car: carInfo,
      createdAt: new Date().toISOString()
    };
  }

  // Add to rides array (this should be accessible from main app)
  if (typeof window.addRide === 'function') {
    window.addRide(ride);
  } else if (typeof rides !== 'undefined') {
    rides.push(ride);

    // Save to localStorage
    if (window.Storage) {
      window.Storage.saveRides(rides);
    }

    if (typeof displayRides === 'function') {
      displayRides();
    }
  }

  // Clear form and close popup
  clearFormFields();
  closePopup();

  // Show success message
  showSuccessMessage('Ride published successfully!');
}

function clearFormFields() {
  document.getElementById('driver').value = '';
  document.getElementById('start').value = '';
  document.getElementById('destination').value = '';
  document.getElementById('time').value = '';
  document.getElementById('seats').value = '1';

  // Clear car information fields
  document.getElementById('car-name').value = '';
  document.getElementById('car-color').value = '';
  document.getElementById('plate-number').value = '';
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
    if (destinationId) {
      alert(validation.message);
      document.getElementById('destination').value = '';
    }
    return;
  }

  // Calculate trip info
  const tripInfo = window.LocationService.getTripInfo(startId, destinationId);

  // Display price information
  if (priceDisplay && priceAmount && priceBreakdown) {
    priceDisplay.style.display = 'block';
    priceAmount.textContent = `RM ${tripInfo.price.toFixed(2)}`;

    let breakdownText = `Distance: ${tripInfo.distance} km | Base: RM ${tripInfo.priceBreakdown.basePrice.toFixed(2)}`;
    if (tripInfo.priceBreakdown.distanceCharge > 0) {
      breakdownText += ` | Distance charge: RM ${tripInfo.priceBreakdown.distanceCharge.toFixed(2)}`;
    }

    priceBreakdown.textContent = breakdownText;
  }
}







// Make remaining functions globally available
window.openPopup = openPopup;
window.closePopup = closePopup;
window.publishRideFromPopup = publishRideFromPopup;
