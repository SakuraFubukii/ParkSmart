// Fetch parking space data
async function fetchParkingData() {
  try {
    const response = await fetch('/data/ParkingSpaces.json');
    const parkingData = await response.json();
    console.log('Fetched parking data:', parkingData);
    updateParkingStatus(parkingData);
  } catch (error) {
    console.error('Error fetching parking data:', error);
  }
}

// Call the function to fetch data and update statuses
fetchParkingData();

// Update parking spot statuses
function updateParkingStatus(data) {
  data.forEach((parkingSpot) => {
    const rect = document.querySelector(`rect[parkid="${parkingSpot.parkid}"]`);
    if (rect) {
      rect.classList.remove('available', 'occupied', 'selected');
      rect.classList.add(parkingSpot.status);

      // When selected
      rect.addEventListener('click', () => {
        if (parkingSpot.status === 'occupied') {
          alert('This parking spot is occupied. Please choose another one.');
          return; // Exit if occupied
        }

        if (parkingSpot.status === 'disabled') {
          alert('This parking spot is under repair. Please choose another one.');
          return; // Exit if disabled
        }

        // Remove selection from other spaces
        document.querySelectorAll('.park.selected').forEach((selectedRect) => {
          selectedRect.classList.remove('selected');
        });

        // Select the clicked space if available
        if (parkingSpot.status === 'available') {
          rect.classList.add('selected');
        }
      });
    }
  });
}

// Select maps
document.getElementById('parkingLotSelect').addEventListener('change', function () {
  const selectedLot = this.value;
  document.querySelectorAll('.map').forEach((map) => {
    map.classList.add('hidden');
  });
  document.getElementById(`${selectedLot}Map`).classList.remove('hidden');
  fetchParkingData();
});

// DOMContentLoaded event to ensure elements are available
document.addEventListener('DOMContentLoaded', () => {
  const halfDayOption = document.getElementById('halfDay');
  const fullDayOption = document.getElementById('fullDay');
  const totalPriceElement = document.getElementById('totalPrice');
  const payButton = document.getElementById('pay');
  const dateInput = document.getElementById('date');
  const parkingSpaces = document.querySelectorAll('.park');
  let parkId = null;

  // Update the price
  function updatePrice() {
    totalPriceElement.textContent = halfDayOption.checked ? '50' : '100';
  }

  halfDayOption.addEventListener('change', updatePrice);
  fullDayOption.addEventListener('change', updatePrice);
  updatePrice();

  // Get the selected park ID
  parkingSpaces.forEach((space) => {
    space.addEventListener('click', () => {
      parkingSpaces.forEach((s) => s.classList.remove('selected'));
      space.classList.add('selected');
      parkId = space.getAttribute('parkid');
    });
  });

  // submission handling
  document.getElementById('pay').addEventListener('click', async (event) => {
    event.preventDefault();
    const date = dateInput.value;

    if (!date) {
      alert('Please select a date.');
      return;
    }

    if (parkId === null) {
      alert('Please select a parking lot.');
      return;
    }
    console.log('Selected Date:', date);
    console.log('Selected Park ID:', parkId);

    // Create request data
    const formData = new FormData();
    formData.append('date', date);
    formData.append('parkId', parkId);

    try {
      const response = await fetch('/book', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Response:', result);
      if (response.ok) {
        window.location.href = `payment.html?date=${encodeURIComponent(result.date)}&parkId=${encodeURIComponent(result.parkId)}`;
      } else {
        alert('Booking failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Unknown error occurred.');
    }
  });
});
