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
  const halfDayOption = document.getElementById('halfDay');
  const fullDayOption = document.getElementById('fullDay');

  parkingData.forEach((parkingSpot) => {
    const rect = document.querySelector(`rect[parkid="${parkingSpot.parkid}"]`);
    const priceText = document.querySelector(`text[parkid="${parkingSpot.parkid}"]`);
    if (rect) {
      rect.classList.remove('available', 'occupied', 'selected');

      const isOccupied = reservations.some((reservation) => {
        const parkIdMatch = String(reservation.parkId) === String(parkingSpot.parkid);
        const dateMatch = String(reservation.date) === dateInput;
        return parkIdMatch && dateMatch;
      });

      if (isOccupied) {
        rect.classList.add('occupied');
        priceText.textContent = 'Reserved'; // Change to "Occupied" if occupied
      } else {
        rect.classList.add('available');
        if (fullDayOption.checked) {
          priceText.textContent = `$${parkingSpot.fullday_price}`; // Display full day price
        } else {
          priceText.textContent = `$${parkingSpot.halfday_price}`; // Display half day price
        }
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
      });
    }
  });
}

async function updateParkingPrice(parkId, newHalfDayPrice, newFullDayPrice) {
  try {
    const response = await fetch('/data/ParkingSpaces.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parkId, newHalfDayPrice, newFullDayPrice }),
    });

    console.log(response);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log(result.message);
  } catch (error) {
    console.error('Error updating parking price:', error);
  }
}

document.getElementById('updatePriceButton').addEventListener('click', async () => {
  const selectedRect = document.querySelector('.park.selected');
  const parkId = selectedRect ? selectedRect.getAttribute('parkid') : null;

  const fullDayPrice = document.getElementById('fullDayPrice').value;
  const halfDayPrice = document.getElementById('halfDayPrice').value;

  if (parkId && (fullDayPrice || halfDayPrice)) {
    await updateParkingPrice(parkId, halfDayPrice || undefined, fullDayPrice || undefined);
  } else {
    alert('Please select a parking spot and enter at least one price.');
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const dateInput = document.getElementById('date');
  const parkingData = await fetchParkingData();

  // Add event listener for date change
  dateInput.addEventListener('change', async () => {
    await fetchParkingData(); // Refresh parking status based on new date
  });

  const halfDayOption = document.getElementById('halfDay');
  const fullDayOption = document.getElementById('fullDay');

  halfDayOption.addEventListener('change', async () => {
    await updateParkingStatus(parkingData); // Refresh prices when the half-day option is selected
  });

  fullDayOption.addEventListener('change', async () => {
    await updateParkingStatus(parkingData); // Refresh prices when the full-day option is selected
  });
});
