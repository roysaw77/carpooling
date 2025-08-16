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

  if (!driver || !startId || !destinationId || !time) {
    alert("Please fill in all fields.");
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

  // Get location names and calculate price
  let ride = { driver, start: startId, destination: destinationId, time, seats };

  if (window.LocationService) {
    const startLocation = window.LocationService.getLocationById(startId);
    const destinationLocation = window.LocationService.getLocationById(destinationId);
    const tripInfo = window.LocationService.getTripInfo(startId, destinationId, true);

    ride = {
      driver,
      start: startLocation ? startLocation.name : startId,
      destination: destinationLocation ? destinationLocation.name : destinationId,
      startId: parseInt(startId),
      destinationId: parseInt(destinationId),
      time,
      seats,
      price: tripInfo.price,
      distance: tripInfo.distance
    };
  }

  // Add to rides array (this should be accessible from main app)
  if (typeof window.addRide === 'function') {
    window.addRide(ride);
  } else if (typeof rides !== 'undefined') {
    rides.push(ride);
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
}

// Request Ride Popup Functions
function openRequestPopup() {
  // Load the request popup content if it doesn't exist
  if (!document.getElementById('request-popup-overlay')) {
    loadRequestPopupForm();
  } else {
    showRequestPopup();
  }
}

function showRequestPopup() {
  const overlay = document.getElementById('request-popup-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeRequestPopup() {
  const overlay = document.getElementById('request-popup-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
  }
}

function loadRequestPopupForm() {
  fetch('forms/request-ride.html')
    .then(response => response.text())
    .then(html => {
      // Extract only the popup content from the loaded HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const popupOverlay = doc.getElementById('request-popup-overlay');

      if (popupOverlay) {
        document.body.appendChild(popupOverlay);

        // Initialize location dropdowns for request form
        initializeLocationDropdowns();

        showRequestPopup();

        // Add event listener for clicking outside the popup to close it
        popupOverlay.addEventListener('click', function (e) {
          if (e.target === popupOverlay) {
            closeRequestPopup();
          }
        });

        // Add escape key listener
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            closeRequestPopup();
          }
        });
      }
    })
    .catch(error => {
      console.error('Error loading request popup form:', error);
      alert('Error loading the request form. Please try again.');
    });
}

function submitRideRequest() {
  const passengerName = document.getElementById('passenger-name').value;
  const studentId = document.getElementById('student-id').value;
  const contactNumber = document.getElementById('contact-number').value;
  const passengerCount = document.getElementById('passenger-count').value;
  const pickupLocation = document.getElementById('pickup-location').value;
  const additionalNotes = document.getElementById('additional-notes').value;

  // Validate required fields
  if (!passengerName || !studentId || !contactNumber || !passengerCount || !pickupLocation) {
    alert("Please fill in all required fields.");
    return;
  }

  // Validate student ID format (10 digits)
  if (!/^\d{10}$/.test(studentId)) {
    alert("Please enter a valid 10-digit MMU Student ID.");
    return;
  }

  // Validate if there are enough seats
  const selectedRide = window.selectedRide;
  if (selectedRide && parseInt(passengerCount) > parseInt(selectedRide.seats)) {
    alert(`Sorry, this ride only has ${selectedRide.seats} available seat(s), but you requested ${passengerCount} seat(s).`);
    return;
  }

  // Create request object
  const rideRequest = {
    passengerName,
    studentId,
    contactNumber,
    passengerCount: parseInt(passengerCount),
    pickupLocation,
    additionalNotes,
    rideIndex: window.selectedRideIndex,
    driver: selectedRide.driver,
    destination: selectedRide.destination,
    requestTime: new Date().toISOString()
  };

  // Store the request and save to localStorage
  if (!window.rideRequests) {
    window.rideRequests = [];
  }
  window.rideRequests.push(rideRequest);

  // Save ride requests to localStorage
  if (window.Storage) {
    window.Storage.saveRideRequests(window.rideRequests);
  }

  // Update available seats
  if (selectedRide) {
    selectedRide.seats = (parseInt(selectedRide.seats) - parseInt(passengerCount)).toString();

    // Save updated rides to localStorage
    if (window.Storage && window.rides) {
      window.Storage.saveRides(window.rides);
    }

    if (typeof window.displayRides === 'function') {
      window.displayRides();
    }
    if (typeof window.displayRideRequests === 'function') {
      window.displayRideRequests();
    }
  }

  // Clear form and close popup
  clearRequestFormFields();
  closeRequestPopup();

  // Show success message
  showSuccessMessage(`Request sent to ${selectedRide.driver}! They will contact you at ${contactNumber}.`);
}

function clearRequestFormFields() {
  if (document.getElementById('passenger-name')) {
    document.getElementById('passenger-name').value = '';
    document.getElementById('student-id').value = '';
    document.getElementById('contact-number').value = '';
    document.getElementById('passenger-count').value = '';
    document.getElementById('pickup-location').value = '';
    document.getElementById('additional-notes').value = '';
  }
}

function showSuccessMessage(message) {
  // Create a temporary success message
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 1001;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(successDiv);

  // Remove after 3 seconds
  setTimeout(() => {
    successDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(successDiv);
    }, 300);
  }, 3000);
}

// Add CSS animation for success message
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Edit Ride Popup Functions
function openEditRidePopup() {
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
  if (window.editingRide) {
    const ride = window.editingRide;

    // Populate form fields with current ride data
    document.getElementById('edit-driver').value = ride.driver;
    document.getElementById('edit-start').value = ride.start;
    document.getElementById('edit-destination').value = ride.destination;
    document.getElementById('edit-time').value = ride.time;
    document.getElementById('edit-seats').value = ride.seats;
  }
}

function saveRideChanges() {
  const driver = document.getElementById('edit-driver').value;
  const start = document.getElementById('edit-start').value;
  const destination = document.getElementById('edit-destination').value;
  const time = document.getElementById('edit-time').value;
  const seats = document.getElementById('edit-seats').value;

  // Validate required fields
  if (!driver || !start || !destination || !time) {
    alert("Please fill in all required fields.");
    return;
  }

  if (window.editingRideIndex !== undefined && window.rides) {
    const oldSeats = parseInt(window.editingRide.seats);
    const newSeats = parseInt(seats);

    // Update the ride
    window.rides[window.editingRideIndex] = {
      driver,
      start,
      destination,
      time,
      seats
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
          request.destination = destination;
        }
      });

      if (typeof window.displayRideRequests === 'function') {
        window.displayRideRequests();
      }
    }

    // Refresh the rides display
    if (typeof window.displayRides === 'function') {
      window.displayRides();
    }

    // Close popup and show success message
    closeEditRidePopup();
    showSuccessMessage('Ride updated successfully!');

    // Clear editing variables
    window.editingRideIndex = undefined;
    window.editingRide = undefined;
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

    // Populate pickup location dropdown (for request ride form)
    const pickupSelect = document.getElementById('pickup-location');
    if (pickupSelect) {
      pickupSelect.innerHTML = locationOptions;
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

  // Calculate trip info (assuming student discount for now)
  const tripInfo = window.LocationService.getTripInfo(startId, destinationId, true);

  // Display price information
  if (priceDisplay && priceAmount && priceBreakdown) {
    priceDisplay.style.display = 'block';
    priceAmount.textContent = `RM ${tripInfo.price.toFixed(2)}`;

    let breakdownText = `Distance: ${tripInfo.distance} units | Base: RM ${tripInfo.priceBreakdown.basePrice.toFixed(2)}`;
    if (tripInfo.priceBreakdown.distanceCharge > 0) {
      breakdownText += ` | Distance charge: RM ${tripInfo.priceBreakdown.distanceCharge.toFixed(2)}`;
    }
    if (tripInfo.isStudent) {
      breakdownText += ` | Student discount: -RM ${tripInfo.priceBreakdown.studentDiscount.toFixed(2)}`;
    }

    priceBreakdown.textContent = breakdownText;
  }
}
