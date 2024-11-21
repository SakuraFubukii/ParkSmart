// Fetch parking space data
async function fetchParkingData() {
  try {
    const response = await fetch('/data/ParkingSpaces.json');
    const parkingData = await response.json();
    console.log('Fetched parking data:', parkingData);
    await updateParkingStatus(parkingData);
    return parkingData; // 返回停车位数据
  } catch (error) {
    console.error('Error fetching parking data:', error);
  }
}

// Fetch reservation data
async function fetchReservationData() {
  try {
    const response = await fetch('/data/Reservations.json');
    const reservationData = await response.json();
    console.log('Fetched reservation data:', reservationData);
    return reservationData;
  } catch (error) {
    console.error('Error fetching reservation data:', error);
    return [];
  }
}

// Update parking spot statuses
async function updateParkingStatus(parkingData) {
  const reservations = await fetchReservationData();
  const dateInput = document.getElementById('date').value;

  parkingData.forEach((parkingSpot) => {
    const rect = document.querySelector(`rect[parkid="${parkingSpot.parkid}"]`);
    if (rect) {
      rect.classList.remove('available', 'occupied', 'selected');

      const isOccupied = reservations.some((reservation) => {
        const parkIdMatch = String(reservation.parkId) === String(parkingSpot.parkid);
        const dateMatch = String(reservation.date) === dateInput;
        return parkIdMatch && dateMatch;
      });

      if (isOccupied) {
        rect.classList.add('occupied');
      } else {
        rect.classList.add('available');
      }

      // Add click event listener for selecting parking spots
      rect.addEventListener('click', () => {
        if (isOccupied) {
          return;
        }

        // Remove selection from other spaces
        document.querySelectorAll('.park.selected').forEach((selectedRect) => {
          selectedRect.classList.remove('selected');
        });

        // Select the clicked space if available
        rect.classList.add('selected');
        updatePrice(parkingData); // Update price without duration options
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
  fetchParkingData(); // Fetch parking data for the selected map
});

// Update the price based on selected options and parking data
function updatePrice(parkingData) {
  const selectedParkingSpot = document.querySelector('.park.selected');
  const totalPriceElement = document.getElementById('totalPrice');

  const halfDayOption = document.getElementById('halfDay'); // Ensure these are defined here
  const fullDayOption = document.getElementById('fullDay');

  if (selectedParkingSpot) {
    const parkId = selectedParkingSpot.getAttribute('parkid');
    const parkingInfo = parkingData.find((spot) => spot.parkid == parkId);

    if (parkingInfo) {
      const price = halfDayOption.checked ? parkingInfo.halfday_price : parkingInfo.fullday_price;
      totalPriceElement.textContent = price;
    }
  } else {
    totalPriceElement.textContent = '0'; // No parking spot selected
  }
}

// DOMContentLoaded event to ensure elements are available
document.addEventListener('DOMContentLoaded', async () => {
  const halfDayOption = document.getElementById('halfDay');
  const fullDayOption = document.getElementById('fullDay');
  const dateInput = document.getElementById('date');

  const parkingData = await fetchParkingData();

  // Update the price when options change
  halfDayOption.addEventListener('change', () => updatePrice(parkingData));
  fullDayOption.addEventListener('change', () => updatePrice(parkingData));

  // Add event listener for date change
  dateInput.addEventListener('change', async () => {
    await fetchParkingData(); // Refresh parking status based on new date
  });

  // Submission handling
  document.getElementById('pay').addEventListener('click', async (event) => {
    event.preventDefault();
    const date = dateInput.value;
    const selectedParkingSpot = document.querySelector('.park.selected');

    if (!date) {
      alert('Please select a date.');
      return;
    }

    if (!selectedParkingSpot) {
      alert('Please select a parking spot.');
      return;
    }

    const parkId = selectedParkingSpot.getAttribute('parkid');
    console.log('Selected Date:', date);
    console.log('Selected Park ID:', parkId);

    // Create request data
    const formData = new FormData();
    formData.append('date', date);
    formData.append('parkId', parkId);
    formData.append('duration', halfDayOption.checked ? 'half' : 'full');

    try {
      const response = await fetch('/book', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Response:', result);
      if (response.ok) {
        const queryParams = new URLSearchParams({
          date: result.date,
          parkId: result.parkId,
          duration: result.duration,
        }).toString();

        window.location.href = `payment.html?${queryParams}`;
      } else {
        alert('Booking failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Unknown error occurred.');
    }
  });
});
