// Fetch parking space data
async function fetchParkingData() {
  try {
    const response = await fetch('/data/ParkingSpaces.json');
    const parkingData = await response.json();
    console.log('Fetched parking data:', parkingData);
    await updateParkingStatus(parkingData);
    return parkingData;
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

// Fetch event data
async function fetchEventData() {
  try {
    const response = await fetch('/data/Events.json');
    const eventData = await response.json();
    console.log('Fetched event data:', eventData);
    return eventData;
  } catch (error) {
    console.error('Error fetching event data:', error);
    return [];
  }
}

// Update parking spot statuses
async function updateParkingStatus(parkingData) {
  const reservations = await fetchReservationData();
  const dateInput = document.getElementById('date').value;
  const fullDayOption = document.getElementById('fullDay');

  parkingData.forEach((parkingSpot) => {
    const rect = document.querySelector(`rect[parkid="${parkingSpot.parkid}"]`);
    const priceText = document.querySelector(`text[parkid="${parkingSpot.parkid}"]`);
    if (rect) {
      rect.classList.remove('available', 'occupied', 'selected');

      const isOccupied = reservations.some((reservation) => {
        const parkIdMatch = String(reservation.parkId) === String(parkingSpot.parkid);
        const dateMatch = String(reservation.date) == dateInput;
        return parkIdMatch && dateMatch;
      });

      if (isOccupied) {
        rect.classList.add('occupied');
        priceText.textContent = 'Reserved';
      } else {
        rect.classList.add('available');
        priceText.textContent = fullDayOption.checked
          ? `$${parkingSpot.fullday_price}`
          : `$${parkingSpot.halfday_price}`;
      }

      // Modify the click event listener for multi-selection
      rect.addEventListener('click', () => {
        if (isOccupied) {
          return;
        }

        // Toggle selection
        rect.classList.toggle('selected');
        updatePrice(parkingData); // Update price based on selected spots
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

async function updatePrice(parkingData) {
  const selectedParkingSpots = document.querySelectorAll('.park.selected');
  const totalPriceElement = document.getElementById('totalPrice');
  const dateInput = document.getElementById('date').value;
  const promoDetailsElement = document.getElementById('promoDetails');
  const promotionInfoElement = document.getElementById('promotionInfo');

  const halfDayOption = document.getElementById('halfDay');
  const fullDayOption = document.getElementById('fullDay');

  let totalPrice = 0;

  for (const selectedParkingSpot of selectedParkingSpots) {
    const parkId = selectedParkingSpot.getAttribute('parkid');
    const parkingInfo = parkingData.find((spot) => spot.parkid == parkId);

    if (parkingInfo) {
      const price = halfDayOption.checked
        ? parseFloat(parkingInfo.halfday_price)
        : parseFloat(parkingInfo.fullday_price);
      totalPrice += price; // Accumulate total price as numbers
    }
  }

  // Check for promotional events
  const events = await fetchEventData();
  const currentDate = new Date(dateInput);
  let discount = 1; // Default to no discount
  let promotionDetails = ''; // Variable to hold promotion details

  events.forEach((event) => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    if (currentDate >= startDate && currentDate <= endDate) {
      discount = event.discount; // Update discount if within promo dates
      promotionDetails = `${event.name} - ${(1 - event.discount) * 100}% off (from ${event.start_date} to ${event.end_date})`;
    }
  });

  const finalPrice = (totalPrice * discount).toFixed(2); // Calculate final price with discount
  totalPriceElement.textContent = `${finalPrice}`;

  // Update promotion details display
  if (promotionDetails) {
    promoDetailsElement.style.display = 'block'; // Show the promo details element
    promotionInfoElement.textContent = promotionDetails; // Set the promotion text
  } else {
    promoDetailsElement.style.display = 'none'; // Hide the promo details element when no promotion
  }
}

// DOMContentLoaded event to ensure elements are available
document.addEventListener('DOMContentLoaded', async () => {
  const halfDayOption = document.getElementById('halfDay');
  const fullDayOption = document.getElementById('fullDay');
  const dateInput = document.getElementById('date');

  const parkingData = await fetchParkingData();

  // Update the price and parking status when options change
  halfDayOption.addEventListener('change', async () => {
    await updatePrice(parkingData);
    await updateParkingStatus(parkingData);
  });

  fullDayOption.addEventListener('change', async () => {
    await updatePrice(parkingData);
    await updateParkingStatus(parkingData);
  });
  // Add event listener for date change
  dateInput.addEventListener('change', async () => {
    const parkingData = await fetchParkingData(); // Fetch new parking data
    await updateParkingStatus(parkingData); // Update parking status without reloading the page
  });

  // Submission handling
  document.getElementById('pay').addEventListener('click', async (event) => {
    event.preventDefault();
    const date = dateInput.value;
    const selectedParkingSpots = document.querySelectorAll('.park.selected');

    if (!date) {
      alert('Please select a date.');
      return;
    }

    if (selectedParkingSpots.length === 0) {
      alert('Please select at least one parking spot.');
      return;
    }

    // Collect parkIds
    const parkIds = Array.from(selectedParkingSpots).map((spot) => spot.getAttribute('parkid'));

    // Ensure parkIds and duration are defined
    if (parkIds.length === 0) {
      alert('No parking spots selected.');
      return;
    }

    const duration = halfDayOption.checked ? 'half' : 'full'; // Ensure duration is correctly determined

    // Log for debugging
    console.log('Selected Date:', date);
    console.log('Selected Park IDs:', parkIds);
    console.log('Selected Duration:', duration);

    // Create request data
    const formData = new FormData();
    formData.append('date', date);
    formData.append('parkIds', JSON.stringify(parkIds)); // Send multiple park IDs
    formData.append('duration', duration); // Use the defined duration

    try {
      const response = await fetch('/book', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Response:', result);
      if (response.ok) {
        // Handle successful booking
        const queryParams = new URLSearchParams({
          date: result.date,
          parkIds: JSON.stringify(parkIds), // Ensure parkIds is correctly formatted
          duration: duration,
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

  halfDayOption.addEventListener('change', async () => {
    await updateParkingStatus(parkingData); // Refresh prices when the half-day option is selected
  });

  fullDayOption.addEventListener('change', async () => {
    await updateParkingStatus(parkingData); // Refresh prices when the full-day option is selected
  });
});
