// fetch parking space data
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

// update parking spot statuses
function updateParkingStatus(data) {
  data.forEach((parkingSpot) => {
    const rect = document.querySelector(`rect[parkid="${parkingSpot.parkid}"]`);
    if (rect) {
      rect.classList.remove('available', 'occupied', 'selected');
      rect.classList.add(parkingSpot.status);

      //when selected
      rect.addEventListener('click', () => {
        if (parkingSpot.status === 'occupied') {
          alert('This parking spot is occupied. Please choose another one.');
          return; // Exit the function if occupied
        }

        if (parkingSpot.status === 'disabled') {
          alert('This parking spot is under repair. Please choose another one.');
          return; // Exit the function if disabled
        }

        document.querySelectorAll('.park.selected').forEach((selectedRect) => {
          selectedRect.classList.remove('selected');
        });

        if (parkingSpot.status === 'available') {
          rect.classList.add('selected');
        }
      });
    }
  });
}

//select maps
document.getElementById('parkingLotSelect').addEventListener('change', function () {
  const selectedLot = this.value;
  document.querySelectorAll('.map').forEach((map) => {
    map.classList.add('hidden');
  });
  document.getElementById(`${selectedLot}Map`).classList.remove('hidden');
  fetchParkingData();
});

document.addEventListener('DOMContentLoaded', () => {
  const halfDayOption = document.getElementById('halfDay');
  const fullDayOption = document.getElementById('fullDay');
  const totalPriceElement = document.getElementById('totalPrice');
  const payButton = document.getElementById('pay');
  const dateInput = document.getElementById('date');
  const parkingLotSelect = document.getElementById('parkingLotSelect');

  //update the price
  function updatePrice() {
    if (halfDayOption.checked) {
      totalPriceElement.textContent = '50';
    } else {
      totalPriceElement.textContent = '100';
    }
  }

  halfDayOption.addEventListener('change', updatePrice);
  fullDayOption.addEventListener('change', updatePrice);

  updatePrice();

  // Event listener for the Pay button
  payButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent form submission for validation
    const selectedDate = dateInput.value;
    const selectedParkingLot = parkingLotSelect.value;

    if (!selectedDate) {
      alert('Please select a date.');
      return;
    }

    if (!selectedParkingLot) {
      alert('Please select a parking lot.');
      return;
    }
  });
});
