// Ride Needs Management Functions
// MMU Carpool Dashboard - Two-way marketplace where seaters post needs and drivers fulfill them

// Display ride needs for drivers to see and offer rides
function displayRideNeeds() {
  const rideNeedsList = document.getElementById('ride-needs-list');
  const rideNeedsSection = document.getElementById('ride-needs-section');

  if (!rideNeedsList || !rideNeedsSection) return;

  if (!window.rideNeeds || window.rideNeeds.length === 0) {
    rideNeedsSection.style.display = 'none';
    return;
  }

  // Filter for open requests only
  const openNeeds = window.rideNeeds.filter(need => need.status === 'open');

  if (openNeeds.length === 0) {
    rideNeedsSection.style.display = 'none';
    return;
  }

  rideNeedsSection.style.display = 'block';

  rideNeedsList.innerHTML = openNeeds.map((need, index) => {
    const actualIndex = window.rideNeeds.indexOf(need);
    const timeDisplay = new Date(need.time).toLocaleString();
    const priceInfo = need.maxPrice ? `<br><strong>Budget:</strong> Up to RM ${need.maxPrice.toFixed(2)}` : '';
    const notesInfo = need.additionalNotes ? `<br><strong>Notes:</strong> ${need.additionalNotes}` : '';

    return `
      <div class="ride-need-item">
        <div class="need-info">
          <h4>🙋 ${need.passengerName} needs a ride</h4>
          <p><strong>Route:</strong> ${need.start} → ${need.destination}</p>
          <p><strong>Time:</strong> ${timeDisplay}</p>
          <p><strong>Passengers:</strong> ${need.passengerCount} person(s)</p>
          <p><strong>Contact:</strong> ${need.contactNumber}${priceInfo}${notesInfo}</p>
          <p><strong>Posted:</strong> ${window.formatDateTime ? window.formatDateTime(need.postedTime) : new Date(need.postedTime).toLocaleDateString()}</p>
        </div>
        <div class="need-actions">
          <button onclick="openOfferPopup(${actualIndex})" class="btn-offer">🚗 Offer to Drive</button>
          <button onclick="contactSeater('${need.contactNumber}', '${need.passengerName}')" class="btn-contact">📞 Contact</button>
        </div>
      </div>
    `;
  }).join('');
}

// Display user's own posted ride needs (for seaters)
function displayMyRideNeeds() {
  const myNeedsList = document.getElementById('my-needs-list');
  const myNeedsSection = document.getElementById('my-needs-section');

  if (!myNeedsList || !myNeedsSection) return;

  // For demo purposes, show all needs as user's own
  // In a real app, you'd filter by actual user ID
  const myNeeds = window.rideNeeds || [];

  if (myNeeds.length === 0) {
    myNeedsSection.style.display = 'none';
    return;
  }

  myNeedsSection.style.display = 'block';

  myNeedsList.innerHTML = myNeeds.map((need, index) => {
    const timeDisplay = new Date(need.time).toLocaleString();
    const statusText = need.status === 'open' ? '📢 Open' :
      need.status === 'fulfilled' ? '✅ Fulfilled' :
        need.status === 'completed' ? '🎉 Completed' : '❌ Cancelled';
    const statusClass = need.status;
    const priceInfo = need.maxPrice ? `<br><strong>Budget:</strong> Up to RM ${need.maxPrice.toFixed(2)}` : '';

    // Show different buttons based on status
    const actionButtons = need.status === 'open' ?
      `<button onclick="cancelRideNeed(${index})" class="btn-cancel-need">❌ Cancel Request</button>` :
      need.status === 'fulfilled' ?
        `<button onclick="completeRideNeed(${index})" class="btn-complete-need">✅ Accept Ride</button>` : '';

    return `
      <div class="my-ride-need ${statusClass}">
        <div class="need-info">
          <h4>Your Ride Request</h4>
          <p><strong>Route:</strong> ${need.start} → ${need.destination}</p>
          <p><strong>Time:</strong> ${timeDisplay}</p>
          <p><strong>Passengers:</strong> ${need.passengerCount} person(s)</p>
          <p><strong>Status:</strong> <span class="need-status ${statusClass}">${statusText}</span>${priceInfo}</p>
          <p><strong>Posted:</strong> ${window.formatDateTime ? window.formatDateTime(need.postedTime) : new Date(need.postedTime).toLocaleDateString()}</p>
        </div>
        <div class="need-actions">
          ${actionButtons}
        </div>
      </div>
    `;
  }).join('');
}

// Driver offers to fulfill a ride need (Legacy function - now handled by popup)
function offerRide(needIndex) {
  // Redirect to the new popup system
  if (typeof openOfferPopup === 'function') {
    openOfferPopup(needIndex);
  } else {
    alert('Please wait for the system to load completely and try again.');
  }
}

// Contact a seater who posted a ride need
function contactSeater(contactNumber, passengerName) {
  alert(`Contact ${passengerName} at: ${contactNumber}`);
}

// Cancel a posted ride need (for seaters)
function cancelRideNeed(needIndex) {
  if (confirm('Are you sure you want to cancel this ride request?')) {
    if (window.rideNeeds && window.rideNeeds[needIndex]) {
      window.rideNeeds[needIndex].status = 'cancelled';

      // Save to localStorage
      if (window.Storage) {
        window.Storage.saveRideNeeds(window.rideNeeds);
      }

      displayRideNeeds();
      displayMyRideNeeds();

      alert('Your ride request has been cancelled.');
    }
  }
}

// Complete a fulfilled ride need (for seaters)
function completeRideNeed(needIndex) {
  if (confirm('Mark this ride as completed? This will remove it from your active requests.')) {
    if (window.rideNeeds && window.rideNeeds[needIndex]) {
      // Remove the completed request
      window.rideNeeds.splice(needIndex, 1);

      // Save to localStorage
      if (window.Storage) {
        window.Storage.saveRideNeeds(window.rideNeeds);
      }

      displayRideNeeds();
      displayMyRideNeeds();

      alert('Ride completed successfully! Thank you for using our carpooling service.');
    }
  }
}

// Make functions globally available
window.displayRideNeeds = displayRideNeeds;
window.displayMyRideNeeds = displayMyRideNeeds;
window.offerRide = offerRide;
window.contactSeater = contactSeater;
window.cancelRideNeed = cancelRideNeed;
window.completeRideNeed = completeRideNeed;

// Ride Need Popup Functions
function openRideNeedPopup() {
  // Load the popup content if it doesn't exist
  if (!document.getElementById('ride-need-popup-overlay')) {
    loadRideNeedPopupForm();
  } else {
    showRideNeedPopup();
  }
}

function showRideNeedPopup() {
  const overlay = document.getElementById('ride-need-popup-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeRideNeedPopup() {
  const overlay = document.getElementById('ride-need-popup-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function loadRideNeedPopupForm() {
  fetch('forms/post-ride-need.html')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const popupOverlay = doc.getElementById('ride-need-popup-overlay');

      if (popupOverlay) {
        document.body.appendChild(popupOverlay);

        // Initialize location dropdowns
        initializeRideNeedLocationDropdowns();

        showRideNeedPopup();

        // Add event listener for clicking outside the popup to close it
        popupOverlay.addEventListener('click', function (e) {
          if (e.target === popupOverlay) {
            closeRideNeedPopup();
          }
        });
      }
    })
    .catch(error => {
      console.error('Error loading ride need form:', error);
      alert('Error loading ride need form. Please try again.');
    });
}

function initializeRideNeedLocationDropdowns() {
  if (window.LocationService) {
    const locationOptions = window.LocationService.generateLocationOptions();

    // Populate start location dropdown
    const startSelect = document.getElementById('need-start');
    if (startSelect) {
      startSelect.innerHTML = locationOptions;
      startSelect.addEventListener('change', updateRideNeedPriceDisplay);
    }

    // Populate destination dropdown
    const destinationSelect = document.getElementById('need-destination');
    if (destinationSelect) {
      destinationSelect.innerHTML = locationOptions;
      destinationSelect.addEventListener('change', updateRideNeedPriceDisplay);
    }
  }
}

function updateRideNeedPriceDisplay() {
  const startId = document.getElementById('need-start')?.value;
  const destinationId = document.getElementById('need-destination')?.value;
  const priceDisplay = document.getElementById('need-price-display');
  const priceAmount = document.getElementById('need-price-amount');
  const priceBreakdown = document.getElementById('need-price-breakdown');

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

function submitRideNeed() {
  const passengerName = document.getElementById('need-passenger-name').value;
  const studentId = document.getElementById('need-student-id').value;
  const contactNumber = document.getElementById('need-contact-number').value;
  const startId = document.getElementById('need-start').value;
  const destinationId = document.getElementById('need-destination').value;
  const time = document.getElementById('need-time').value;
  const passengerCount = document.getElementById('need-passenger-count').value;
  const maxPrice = document.getElementById('need-max-price').value;
  const additionalNotes = document.getElementById('need-additional-notes').value;

  // Validate required fields
  if (!passengerName || !studentId || !contactNumber || !startId || !destinationId || !time || !passengerCount) {
    alert("Please fill in all required fields.");
    return;
  }

  // Get location names
  let startName = startId;
  let destinationName = destinationId;

  if (window.LocationService) {
    const startLocation = window.LocationService.getLocationById(startId);
    const destinationLocation = window.LocationService.getLocationById(destinationId);
    startName = startLocation ? startLocation.name : startId;
    destinationName = destinationLocation ? destinationLocation.name : destinationId;
  }

  // Create ride need object
  const rideNeed = {
    id: Date.now(),
    passengerName: passengerName,
    studentId: studentId,
    contactNumber: contactNumber,
    start: startName,
    destination: destinationName,
    startId: parseInt(startId),
    destinationId: parseInt(destinationId),
    time: time,
    passengerCount: parseInt(passengerCount),
    maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    additionalNotes: additionalNotes,
    postedTime: new Date().toISOString(),
    status: 'open' // open, fulfilled, cancelled
  };

  // Add to ride needs array
  if (!window.rideNeeds) {
    window.rideNeeds = [];
  }
  window.rideNeeds.push(rideNeed);

  // Save to localStorage
  if (window.Storage) {
    window.Storage.saveRideNeeds(window.rideNeeds);
  }

  // Refresh displays
  if (typeof displayRideNeeds === 'function') displayRideNeeds();
  if (typeof displayMyRideNeeds === 'function') displayMyRideNeeds();

  // Clear form and close popup
  clearRideNeedForm();
  closeRideNeedPopup();

  alert("Your ride request has been posted successfully! Drivers can now see and offer to fulfill your request.");
}

function clearRideNeedForm() {
  const form = document.getElementById('ride-need-form');
  if (form) {
    form.reset();
  }

  // Hide price display
  const priceDisplay = document.getElementById('need-price-display');
  if (priceDisplay) {
    priceDisplay.style.display = 'none';
  }
}

// Make popup functions globally available
window.openRideNeedPopup = openRideNeedPopup;
window.closeRideNeedPopup = closeRideNeedPopup;
window.submitRideNeed = submitRideNeed;
