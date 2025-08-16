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
      need.status === 'fulfilled' ? '✅ Fulfilled' : '❌ Cancelled';
    const statusClass = need.status;
    const priceInfo = need.maxPrice ? `<br><strong>Budget:</strong> Up to RM ${need.maxPrice.toFixed(2)}` : '';

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
          ${need.status === 'open' ? `<button onclick="cancelRideNeed(${index})" class="btn-cancel-need">❌ Cancel Request</button>` : ''}
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

// Make functions globally available
window.displayRideNeeds = displayRideNeeds;
window.displayMyRideNeeds = displayMyRideNeeds;
window.offerRide = offerRide;
window.contactSeater = contactSeater;
window.cancelRideNeed = cancelRideNeed;
