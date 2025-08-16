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
  const start = document.getElementById('start').value;
  const destination = document.getElementById('destination').value;
  const time = document.getElementById('time').value;
  const seats = document.getElementById('seats').value;

  if (!driver || !start || !destination || !time) {
    alert("Please fill in all fields.");
    return;
  }

  const ride = { driver, start, destination, time, seats };

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
