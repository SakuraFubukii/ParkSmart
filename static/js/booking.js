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

// Call the function to fetch data and update statuses
fetchParkingData();
