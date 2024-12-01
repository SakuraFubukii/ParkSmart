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
  const fullDayOption = document.getElementById('fullDay');
  const infoDisplay = document.getElementById('infoDisplay');

  parkingData.forEach((parkingSpot) => {
    const rect = document.querySelector(`rect[parkid="${parkingSpot.parkid}"]`);
    const priceText = document.querySelector(`text[parkid="${parkingSpot.parkid}"]`);
    if (rect) {
      rect.classList.remove('available', 'occupied', 'selected');

      const isOccupied = reservations.some((reservation) => {
        const parkIdMatch = String(reservation.parkId) == String(parkingSpot.parkid);
        const dateMatch = String(reservation.date) == dateInput;
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
          const reservation = reservations.find((res) => res.parkId == parkingSpot.parkid && res.date == dateInput);
          if (reservation) {
            // Check if the user is an admin or a regular user
            if (reservation.user_id === 'admin') {
              infoDisplay.innerHTML = `
                  <strong>Occupied:</strong><br>
                  Status: Administrator has locked this parking spot.<br>
                  Date: ${reservation.date}<br>
                  Duration: ${reservation.duration}<br>
                  Book Time: ${new Date(reservation.booktime).toLocaleString()}<br>
                  Comment: ${reservation.comment || 'None'}
                `;
            } else {
              infoDisplay.innerHTML = `
                <strong>Occupied:</strong><br>
                User: ${reservation.user_id}<br>
                Date: ${reservation.date}<br>
                Duration: ${reservation.duration}<br>
                Book Time: ${new Date(reservation.booktime).toLocaleString()}<br>
                Comment: ${reservation.comment || 'None'}
              `;
            }
          }
          return;
        }

        // Check if the status is "occupied" and date is not selected
        const parkingStatusSelect = document.getElementById('parkingStatus');
        if (parkingStatusSelect.value === 'occupied' && !dateInput) {
          alert('Please select a date before choosing occupied status.');
          return;
        }

        // Remove selection from other spaces
        document.querySelectorAll('.park.selected').forEach((selectedRect) => {
          selectedRect.classList.remove('selected');
        });

        // Select the clicked space if available
        rect.classList.add('selected');

        // If selected space is available, show "Available"
        infoDisplay.innerHTML = '<strong>Available</strong>';
      });
    }
  });

  if (!document.querySelector('.park.selected')) {
    infoDisplay.innerHTML = '<strong>Please select a parking spot</strong>'; // Display message if nothing is selected
  }
}

async function updateParkingPrice(parkId, newHalfDayPrice, newFullDayPrice, reservationData, op_status) {
  try {
    const response = await fetch('/manage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parkId, newHalfDayPrice, newFullDayPrice, reservationData, op_status }),
    });

    console.log(response);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log(result.message);

    alert(result.message);
    location.reload();
  } catch (error) {
    console.error('Error updating parking price:', error);
  }
}

document.getElementById('updatePriceButton').addEventListener('click', async () => {
  const selectedRect = document.querySelector('.park.selected');
  const parkId = selectedRect ? selectedRect.getAttribute('parkid') : null;
  const parkingStatusSelect = document.getElementById('parkingStatus');
  const selectedStatus = parkingStatusSelect.value;

  const fullDayPrice = document.getElementById('fullDayPrice').value;
  const halfDayPrice = document.getElementById('halfDayPrice').value;

  if (parkId && (fullDayPrice || halfDayPrice)) {
    if (selectedStatus) {
      let op_status = 0;
      if (selectedStatus == 'occupied') {
        op_status = 1;
      }
      const reservationData = {
        user_id: 'admin',
        parkId: parkId,
        date: document.getElementById('date').value,
        duration: document.querySelector('input[name="duration"]:checked').value,
        booktime: new Date().toISOString(),
        payment_status: 'none',
        comment: 'Blocked by admin',
      };
      await updateParkingPrice(
        parkId,
        halfDayPrice || undefined,
        fullDayPrice || undefined,
        reservationData,
        op_status
      );
    } else {
      alert('Please select a parking status.');
    }
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
