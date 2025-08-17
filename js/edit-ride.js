// Edit Ride Functions
// MMU Carpool Dashboard

// Edit Ride Popup Functions
function openEditRidePopup(index) {
  // Store the ride being edited
  if (index !== undefined && window.rides && window.rides[index]) {
    window.editingRideIndex = index;
    window.editingRide = window.rides[index];
  }

  // Load the edit popup content if it doesn't exist
  if (!document.getElementById('edit-ride-popup-overlay')) {
    loadEditRidePopupForm();
  } else {
    populateEditForm();
    showEditRidePopup();
  }
}

function showEditRidePopup() {
  const overlay = document.getElementById('edit-ride-popup-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeEditRidePopup() {
  const overlay = document.getElementById('edit-ride-popup-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
  }
}

function loadEditRidePopupForm() {
  fetch('forms/edit-ride.html')
    .then(response => response.text())
    .then(html => {
      // Extract only the popup content from the loaded HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const popupOverlay = doc.getElementById('edit-ride-popup-overlay');

      if (popupOverlay) {
        document.body.appendChild(popupOverlay);
        populateEditForm();
        showEditRidePopup();

        // Add event listener for clicking outside the popup to close it
        popupOverlay.addEventListener('click', function (e) {
          if (e.target === popupOverlay) {
            closeEditRidePopup();
          }
        });

        // Add escape key listener
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            closeEditRidePopup();
          }
        });
      }
    })
    .catch(error => {
      console.error('Error loading edit popup form:', error);
      alert('Error loading the edit form. Please try again.');
    });
}

function populateEditForm() {
  // First, populate the location dropdowns
  initializeEditLocationDropdowns();

  if (window.editingRide) {
    const ride = window.editingRide;

    // Wait a moment for dropdowns to be populated, then set values
    setTimeout(() => {
      // Populate form fields with current ride data
      const driverInput = document.getElementById('edit-driver');
      if (driverInput) driverInput.value = ride.driver || '';

      // For location dropdowns, check if we have startId/destinationId or just names
      if (ride.startId !== undefined) {
        // Use the ID if available
        const editStartSelect = document.getElementById('edit-start');
        if (editStartSelect) editStartSelect.value = ride.startId;
      } else {
        // Fall back to setting by name
        setEditLocationValue('edit-start', ride.start);
      }

      if (ride.destinationId !== undefined) {
        // Use the ID if available
        const editDestinationSelect = document.getElementById('edit-destination');
        if (editDestinationSelect) editDestinationSelect.value = ride.destinationId;
      } else {
        // Fall back to setting by name
        setEditLocationValue('edit-destination', ride.destination);
      }

      const timeInput = document.getElementById('edit-time');
      if (timeInput) timeInput.value = ride.time || '';

      const seatsSelect = document.getElementById('edit-seats');
      if (seatsSelect) seatsSelect.value = ride.seats || '1';

      // Populate car information if available
      if (ride.car) {
        console.log('Car data found:', ride.car);
        const carNameInput = document.getElementById('edit-car-name');
        if (carNameInput) carNameInput.value = ride.car.name || '';

        const carColorSelect = document.getElementById('edit-car-color');
        if (carColorSelect) carColorSelect.value = ride.car.color || '';

        const plateInput = document.getElementById('edit-plate-number');
        if (plateInput) plateInput.value = ride.car.plateNumber || '';
      } else if (ride.carDetails) {
        console.log('CarDetails data found:', ride.carDetails);
        // Handle legacy carDetails format
        const carNameInput = document.getElementById('edit-car-name');
        if (carNameInput) carNameInput.value = `${ride.carDetails.brand || ''} ${ride.carDetails.model || ''}`.trim();

        const carColorSelect = document.getElementById('edit-car-color');
        if (carColorSelect) carColorSelect.value = ride.carDetails.color || '';

        const plateInput = document.getElementById('edit-plate-number');
        if (plateInput) plateInput.value = ride.carDetails.licensePlate || '';
      } else if (ride.carInfo) {
        console.log('CarInfo data found:', ride.carInfo);
        // Handle carInfo format (from offers)
        const carNameInput = document.getElementById('edit-car-name');
        if (carNameInput) {
          // Parse carInfo string like "Red Toyota Vios - ABC1234"
          const parts = ride.carInfo.split(' - ');
          if (parts.length === 2) {
            const carPart = parts[0].trim();
            const platePart = parts[1].trim();

            // Extract color and car name from "Red Toyota Vios"
            const carWords = carPart.split(' ');
            if (carWords.length >= 2) {
              const color = carWords[0];
              const carName = carWords.slice(1).join(' ');

              carNameInput.value = carName;

              const carColorSelect = document.getElementById('edit-car-color');
              if (carColorSelect) carColorSelect.value = color;

              const plateInput = document.getElementById('edit-plate-number');
              if (plateInput) plateInput.value = platePart;
            }
          }
        }
      } else {
        console.log('No car data found in ride:', ride);
        // Set empty values to prevent undefined
        const carNameInput = document.getElementById('edit-car-name');
        if (carNameInput) carNameInput.value = '';

        const carColorSelect = document.getElementById('edit-car-color');
        if (carColorSelect) carColorSelect.value = '';

        const plateInput = document.getElementById('edit-plate-number');
        if (plateInput) plateInput.value = '';
      }

      // Update price display after setting locations
      updateEditPriceDisplay();
    }, 100); // Small delay to ensure dropdowns are populated
  }
}

// Initialize location dropdowns for edit form
function initializeEditLocationDropdowns() {
  if (window.LocationService) {
    const locationOptions = window.LocationService.generateLocationOptions();

    // Populate edit start location dropdown
    const editStartSelect = document.getElementById('edit-start');
    if (editStartSelect) {
      editStartSelect.innerHTML = locationOptions;
      editStartSelect.addEventListener('change', updateEditPriceDisplay);
    }

    // Populate edit destination dropdown
    const editDestinationSelect = document.getElementById('edit-destination');
    if (editDestinationSelect) {
      editDestinationSelect.innerHTML = locationOptions;
      editDestinationSelect.addEventListener('change', updateEditPriceDisplay);
    }
  }
}

// Set location value in edit form (by name or ID)
function setEditLocationValue(elementId, locationName) {
  const selectElement = document.getElementById(elementId);
  if (!selectElement || !window.LocationService) return;

  // Try to find the location by name first
  const location = window.LocationService.getLocationByName(locationName);
  if (location) {
    selectElement.value = location.id;
  } else {
    // If not found by name, try to set directly (in case it's already an ID)
    selectElement.value = locationName;
  }
}

// Update price display for edit form
function updateEditPriceDisplay() {
  const startId = document.getElementById('edit-start')?.value;
  const destinationId = document.getElementById('edit-destination')?.value;
  const priceDisplay = document.getElementById('edit-price-display');
  const priceAmount = document.getElementById('edit-price-amount');
  const priceBreakdown = document.getElementById('edit-price-breakdown');

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

function saveRideChanges() {
  const driver = document.getElementById('edit-driver').value;
  const startId = document.getElementById('edit-start').value;
  const destinationId = document.getElementById('edit-destination').value;
  const time = document.getElementById('edit-time').value;
  const seats = document.getElementById('edit-seats').value;

  // Get car information
  const carName = document.getElementById('edit-car-name').value;
  const carColor = document.getElementById('edit-car-color').value;
  const plateNumber = document.getElementById('edit-plate-number').value;

  // Validate required fields
  if (!driver || !startId || !destinationId || !time || !carName || !carColor || !plateNumber) {
    // Debug: Log which fields are missing
    const missingFields = [];
    if (!driver) missingFields.push('Driver Name');
    if (!startId) missingFields.push('Start Location');
    if (!destinationId) missingFields.push('Destination');
    if (!time) missingFields.push('Date & Time');
    if (!carName) missingFields.push('Car Name');
    if (!carColor) missingFields.push('Car Color');
    if (!plateNumber) missingFields.push('Number Plate');

    alert("Please fill in all required fields: " + missingFields.join(', '));
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

  if (window.editingRideIndex !== undefined && window.rides) {
    const oldSeats = parseInt(window.editingRide.seats);
    const newSeats = parseInt(seats);

    // Update the ride
    window.rides[window.editingRideIndex] = {
      id: window.editingRide.id || Date.now(),
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
      createdAt: window.editingRide.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Handle seat changes - if seats reduced, check requests
    if (newSeats < oldSeats && window.rideRequests) {
      const affectedRequests = window.rideRequests.filter(request =>
        request.rideIndex === window.editingRideIndex
      );

      let totalRequestedSeats = affectedRequests.reduce((total, request) =>
        total + request.passengerCount, 0
      );

      if (totalRequestedSeats > newSeats) {
        alert(`Warning: You've reduced seats but there are ${totalRequestedSeats} seats already requested. Please contact the passengers to resolve this.`);
      }
    }

    // Update any related ride requests with new ride info
    if (window.rideRequests) {
      window.rideRequests.forEach(request => {
        if (request.rideIndex === window.editingRideIndex) {
          request.driver = driver;
          request.destination = destinationName;
        }
      });

      if (typeof window.displayRideRequests === 'function') {
        window.displayRideRequests();
      }

      // Save updated requests to localStorage
      if (window.Storage) {
        window.Storage.saveRideRequests(window.rideRequests);
      }
    }

    // Save updated rides to localStorage
    if (window.Storage) {
      window.Storage.saveRides(window.rides);
    }

    // Refresh the rides display
    if (typeof window.displayRides === 'function') {
      window.displayRides();
    }

    // Refresh driver rides display
    if (typeof window.displayDriverRides === 'function') {
      window.displayDriverRides();
    }

    // Close popup and show success message
    closeEditRidePopup();
    showSuccessMessage('Ride updated successfully!');

    // Clear editing variables
    window.editingRideIndex = undefined;
    window.editingRide = undefined;
  }
}

function showSuccessMessage(message) {
  // Create a temporary success message element
  const successDiv = document.createElement('div');
  successDiv.textContent = message;
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 10000;
    font-weight: 500;
  `;

  document.body.appendChild(successDiv);

  // Remove the message after 3 seconds
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 3000);
}

// Make functions globally available
window.openEditRidePopup = openEditRidePopup;
window.closeEditRidePopup = closeEditRidePopup;
window.saveRideChanges = saveRideChanges;
