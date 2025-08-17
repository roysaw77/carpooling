// Driver Offer Functions
// MMU Carpool Dashboard - Driver offering rides to fulfill seater requests

function openOfferPopup(needIndex) {
  // Store the need index for later use
  window.currentOfferNeedIndex = needIndex;

  // Load the popup content if it doesn't exist
  if (!document.getElementById('offer-popup-overlay')) {
    loadOfferForm();
  } else {
    showOfferPopup();
  }
}

function showOfferPopup() {
  const overlay = document.getElementById('offer-popup-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeOfferPopup() {
  const overlay = document.getElementById('offer-popup-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function loadOfferForm() {
  fetch('forms/offer-drive.html')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const popupOverlay = doc.getElementById('offer-popup-overlay');

      if (popupOverlay) {
        document.body.appendChild(popupOverlay);

        // Add form submit handler
        const form = document.getElementById('offer-form');
        if (form) {
          form.addEventListener('submit', submitDriverOffer);
        }

        showOfferPopup();

        // Add event listener for clicking outside the popup to close it
        popupOverlay.addEventListener('click', function (e) {
          if (e.target === popupOverlay) {
            closeOfferPopup();
          }
        });
      }
    })
    .catch(error => {
      console.error('Error loading offer form:', error);
      alert('Error loading offer form. Please try again.');
    });
}

function submitDriverOffer(event) {
  event.preventDefault();

  const needIndex = window.currentOfferNeedIndex;
  if (!window.rideNeeds || !window.rideNeeds[needIndex]) {
    alert('Error: Ride request not found.');
    return;
  }

  const need = window.rideNeeds[needIndex];

  if (need.status !== 'open') {
    alert('This ride request is no longer available.');
    closeOfferPopup();
    return;
  }

  // Get form data
  const formData = new FormData(event.target);
  const driverName = formData.get('driverName').trim();
  const driverContact = formData.get('driverContact').trim();
  const carBrand = formData.get('carBrand');
  const carModel = formData.get('carModel').trim();
  const carColor = formData.get('carColor');
  const licensePlate = formData.get('licensePlate').trim().toUpperCase();
  const pickupDetails = formData.get('pickupDetails').trim();
  const driverNotes = formData.get('driverNotes').trim();

  // Validate required fields
  if (!driverName || !driverContact || !carBrand || !carModel || !carColor || !licensePlate) {
    alert('Please fill in all required fields.');
    return;
  }

  // Create car info string
  const carInfo = `${carColor} ${carBrand} ${carModel} - ${licensePlate}`;

  // Create a ride offer
  const rideOffer = {
    id: Date.now(),
    driver: driverName,
    driverContact: driverContact,
    carInfo: carInfo,
    carDetails: {
      brand: carBrand,
      model: carModel,
      color: carColor,
      licensePlate: licensePlate
    },
    pickupDetails: pickupDetails,
    driverNotes: driverNotes,
    start: need.start,
    destination: need.destination,
    time: need.time,
    seats: "0", // Set to 0 since the request is already fulfilled
    originalSeats: need.passengerCount, // Store original passenger count for reference
    passengerName: need.passengerName,
    passengerContact: need.contactNumber,
    needId: need.id,
    createdAt: new Date().toISOString()
  };

  // Add to rides array
  if (!window.rides) {
    window.rides = [];
  }
  window.rides.push(rideOffer);

  // Mark the need as fulfilled
  need.status = 'fulfilled';
  need.fulfilledBy = driverName;
  need.fulfilledAt = new Date().toISOString();

  // Save to localStorage
  if (window.Storage) {
    window.Storage.saveRides(window.rides);
    window.Storage.saveRideNeeds(window.rideNeeds);
  }

  // Close popup and clear form
  closeOfferPopup();
  clearOfferForm();

  // Refresh displays
  if (typeof displayRideNeeds === 'function') displayRideNeeds();
  if (typeof displayMyRideNeeds === 'function') displayMyRideNeeds();
  if (typeof displayDriverRides === 'function') displayDriverRides();

  alert(`Great! You've offered to drive ${need.passengerName} (${need.passengerCount} passenger(s)). The ride has been created with 0 available seats since it's already fulfilled. If you want to pick up more passengers, please publish a separate new ride. Contact them at ${need.contactNumber} to arrange pickup details.`);
}

function clearOfferForm() {
  const form = document.getElementById('offer-form');
  if (form) {
    form.reset();
  }
}

// Make functions globally available
window.openOfferPopup = openOfferPopup;
window.closeOfferPopup = closeOfferPopup;
window.submitDriverOffer = submitDriverOffer;
