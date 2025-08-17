// Ride Requests Management Functions
// MMU Carpool Dashboard

// Function to request a ride
function requestRide(rideIndex) {
  if (typeof openRideRequestPopup === 'function') {
    openRideRequestPopup(rideIndex);
  } else {
    // Fallback inline request (if popup fails to load)
    const passengerName = prompt("Enter your name:");
    const studentId = prompt("Enter your student ID:");
    const contactNumber = prompt("Enter your contact number:");
    const passengerCount = prompt("How many passengers? (including you):");

    if (!passengerName || !studentId || !contactNumber || !passengerCount) {
      alert("Please provide all required information.");
      return;
    }

    const numPassengers = parseInt(passengerCount);
    if (isNaN(numPassengers) || numPassengers < 1) {
      alert("Please enter a valid number of passengers.");
      return;
    }

    const ride = window.rides[rideIndex];
    const availableSeats = parseInt(ride.seats);

    if (numPassengers > availableSeats) {
      alert(`Sorry, only ${availableSeats} seats are available.`);
      return;
    }

    // Create ride request
    const request = {
      rideIndex: rideIndex,
      passengerName: passengerName,
      studentId: studentId,
      contactNumber: contactNumber,
      passengerCount: numPassengers,
      driver: ride.driver,
      destination: ride.destination,
      requestTime: new Date().toISOString(),
      status: 'pending'
    };

    // Add to requests
    window.rideRequests.push(request);

    // Reduce available seats
    window.rides[rideIndex].seats = (availableSeats - numPassengers).toString();

    // Save to localStorage
    if (window.Storage) {
      window.Storage.saveRideRequests(window.rideRequests);
      window.Storage.saveRides(window.rides);
    }

    // Refresh displays
    if (typeof displayRides === 'function') displayRides();
    if (typeof displayAvailableRides === 'function') displayAvailableRides();
    if (typeof displayRideRequests === 'function') displayRideRequests();

    alert(`Request sent successfully! The driver will review your request.`);
  }
}

// Display ride requests for drivers to accept/reject
function displayRideRequests() {
  const requestsList = document.getElementById('requests-list');
  const requestsSection = document.getElementById('requests-section');

  if (!requestsList || !requestsSection) return;

  if (!window.rideRequests || window.rideRequests.length === 0) {
    requestsSection.style.display = 'none';
    return;
  }

  requestsSection.style.display = 'block';
  requestsList.innerHTML = window.rideRequests.map((request, index) => {
    return `
      <div class="request-item">
        <div class="request-info">
          <h4>${request.passengerName}</h4>
          <p><strong>Student ID:</strong> ${request.studentId}</p>
          <p><strong>Contact:</strong> ${request.contactNumber}</p>
          <p><strong>Passengers:</strong> ${request.passengerCount}</p>
          <p><strong>Destination:</strong> ${request.destination}</p>
          <p><strong>Requested:</strong> ${window.formatDateTime ? window.formatDateTime(request.requestTime) : new Date(request.requestTime).toLocaleDateString()}</p>
        </div>
        <div class="request-actions">
          <button onclick="acceptRequest(${index})" class="btn-accept">✅ Accept</button>
          <button onclick="declineRequest(${index})" class="btn-reject">❌ Decline</button>
        </div>
      </div>
    `;
  }).join('');
}

// Display driver requests (for driver mode)
function displayDriverRequests() {
  const requestsList = document.getElementById('driver-requests-list');
  const requestsSection = document.getElementById('driver-requests-section');

  if (!requestsList || !requestsSection) return;

  if (!window.rideRequests || window.rideRequests.length === 0) {
    requestsSection.style.display = 'none';
    return;
  }

  requestsSection.style.display = 'block';
  requestsList.innerHTML = window.rideRequests.map((request, index) => {
    return `
      <div class="request-item">
        <div class="request-info">
          <h4>${request.passengerName}</h4>
          <p><strong>Student ID:</strong> ${request.studentId}</p>
          <p><strong>Contact:</strong> ${request.contactNumber}</p>
          <p><strong>Passengers:</strong> ${request.passengerCount}</p>
          <p><strong>Destination:</strong> ${request.destination}</p>
          <p><strong>Requested:</strong> ${window.formatDateTime ? window.formatDateTime(request.requestTime) : new Date(request.requestTime).toLocaleDateString()}</p>
        </div>
        <div class="request-actions">
          <button onclick="acceptRequest(${index})" class="btn-accept">✅ Accept</button>
          <button onclick="declineRequest(${index})" class="btn-reject">❌ Decline</button>
        </div>
      </div>
    `;
  }).join('');
}

// Display user's own ride requests (for seater mode)
function displayMyRequests() {
  const requestsList = document.getElementById('my-requests-list');
  const requestsSection = document.getElementById('my-requests-section');

  if (!requestsList || !requestsSection) return;

  // For demo purposes, show all requests as user's own
  // In a real app, you'd filter by the actual user's ID
  const myRequests = window.rideRequests; // In reality: rideRequests.filter(req => req.userId === currentUserId)

  if (!myRequests || myRequests.length === 0) {
    requestsSection.style.display = 'none';
    return;
  }

  requestsSection.style.display = 'block';
  requestsList.innerHTML = myRequests.map((request, index) => {
    const statusText = request.status === 'accepted' ? '✅ Accepted' :
      request.status === 'declined' ? '❌ Declined' :
        request.status === 'completed' ? '🎉 Completed' : '⏳ Pending';

    // Show complete button only for accepted requests
    const completeButton = request.status === 'accepted' ?
      `<button onclick="completeRequest(${index})" class="btn-complete">✅ Accept Ride</button>` : '';

    return `
      <div class="request-item my-request ${request.status}">
        <div class="request-info">
          <h4>Request to ${request.driver}</h4>
          <p><strong>Destination:</strong> ${request.destination}</p>
          <p><strong>Passengers:</strong> ${request.passengerCount}</p>
          <p><strong>Contact:</strong> ${request.contactNumber}</p>
          <p><strong>Status:</strong> <span class="request-status ${request.status}">${statusText}</span></p>
          <p><strong>Requested:</strong> ${window.formatDateTime ? window.formatDateTime(request.requestTime) : new Date(request.requestTime).toLocaleDateString()}</p>
        </div>
        <div class="request-actions">
          ${completeButton}
        </div>
      </div>
    `;
  }).join('');
}

// Complete a ride request (for seater mode)
function completeRequest(index) {
  if (confirm('Mark this ride as completed? This will remove it from your active requests.')) {
    if (window.rideRequests && window.rideRequests[index]) {
      // Remove the completed request
      window.rideRequests.splice(index, 1);

      // Save to localStorage
      if (window.Storage) {
        window.Storage.saveRideRequests(window.rideRequests);
      }

      // Refresh displays
      displayMyRequests();
      if (typeof displayRideRequests === 'function') displayRideRequests();
      if (typeof displayDriverRequests === 'function') displayDriverRequests();

      alert('Ride completed successfully! Thank you for using our carpooling service.');
    }
  }
}

// Make functions globally available
window.requestRide = requestRide;
window.displayRideRequests = displayRideRequests;
window.displayDriverRequests = displayDriverRequests;
window.displayMyRequests = displayMyRequests;
window.completeRequest = completeRequest;

// Request Ride Popup Functions
function openRideRequestPopup(rideIndex) {
  // Store the selected ride for the request
  window.selectedRideIndex = rideIndex;
  window.selectedRide = window.rides[rideIndex];

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
  const additionalNotes = document.getElementById('additional-notes').value;

  // Validate required fields
  if (!passengerName || !studentId || !contactNumber || !passengerCount) {
    alert("Please fill in all required fields.");
    return;
  }

  const selectedRide = window.selectedRide;
  if (!selectedRide) {
    alert("Error: Selected ride not found.");
    closeRequestPopup();
    return;
  }

  const availableSeats = parseInt(selectedRide.seats);
  const requestedSeats = parseInt(passengerCount);

  if (requestedSeats > availableSeats) {
    alert(`Sorry, this ride only has ${selectedRide.seats} available seat(s), but you requested ${passengerCount} seat(s).`);
    return;
  }

  // Create request object
  const rideRequest = {
    passengerName,
    studentId,
    contactNumber,
    passengerCount: parseInt(passengerCount),
    additionalNotes,
    rideIndex: window.selectedRideIndex,
    driver: selectedRide.driver,
    destination: selectedRide.destination,
    requestTime: new Date().toISOString(),
    status: 'pending'
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
    if (window.Storage) {
      window.Storage.saveRides(window.rides);
    }
  }

  // Refresh displays
  if (typeof displayRides === 'function') displayRides();
  if (typeof displayDriverRides === 'function') displayDriverRides();
  if (typeof displayAvailableRides === 'function') displayAvailableRides();
  if (typeof displayRideRequests === 'function') displayRideRequests();

  // Clear form and close popup
  clearRequestFormFields();
  closeRequestPopup();

  alert("Your ride request has been submitted successfully! The driver will review your request.");
}

function clearRequestFormFields() {
  const form = document.getElementById('request-form');
  if (form) {
    form.reset();
  }
}

// Make popup functions globally available
window.openRideRequestPopup = openRideRequestPopup;
window.closeRequestPopup = closeRequestPopup;
window.submitRideRequest = submitRideRequest;
