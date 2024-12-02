// Function to retrieve query parameters from the URL
function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const regex = /([^&=]+)=([^&]*)/g;
  let match;
  while ((match = regex.exec(queryString))) {
    params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }
  return params;
}

// Get the parameters and display them
const queryParams = getQueryParams();
document.getElementById('selectedDate').textContent = queryParams.date || 'N/A';
document.getElementById('durationDisplay').textContent = queryParams.duration === 'full' ? 'Full Day' : 'Half Day';

// Display selected park IDs
const parkIds = JSON.parse(queryParams.parkIds || '[]'); // Parse parkIds as an array
const selectedParkIdDisplay = document.getElementById('selectedParkIds');
selectedParkIdDisplay.textContent = parkIds.length > 0 ? parkIds.join(', ') : 'N/A';

// Get the current logged-in user's ID
const userId = getCurrentUserId();

// Handle payment method selection
document.getElementById('paymentMethod').addEventListener('change', function () {
  const selectedMethod = this.value;
  document.querySelectorAll('.payment-option').forEach((option) => {
    option.style.display = 'none'; // Hide all options
  });
  if (selectedMethod) {
    document.getElementById(selectedMethod).style.display = 'block'; // Show selected option
  }
});

// Handle form submission for credit card
document.getElementById('paymentForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  await processPayment(parkIds);
});

// Handle button click for Alipay
document.getElementById('alipayDone')?.addEventListener('click', async () => {
  await processPayment(parkIds);
});

// Handle button click for WeChat
document.getElementById('wechatDone')?.addEventListener('click', async () => {
  await processPayment(parkIds);
});

// Function to process payment and submit reservations
async function processPayment(parkIds) {
  for (const parkId of parkIds) {
    const paymentData = {
      user_id: userId, // Use the current logged-in user's ID
      parkId: parkId, // Use the current parking spot ID in the loop
      date: queryParams.date,
      duration: queryParams.duration,
      booktime: new Date().toISOString(),
      payment_status: 'completed',
      comment: '',
    };
    await submitReservation(paymentData);
  }
  // After all reservations are complete, redirect to transaction history
  alert('Payment processed for booking on ' + queryParams.date + ' for parking spots: ' + parkIds.join(', '));
  window.location.href = '/transaction.html'; // Redirect to transaction history page
}

// Function to submit reservation data to Reservations.json
async function submitReservation(data) {
  try {
    // Fetch the current reservations to determine the next ID
    const response = await fetch('/book/data/Reservations.json');
    if (!response.ok) {
      throw new Error('Failed to load reservations file');
    }
    const reservations = await response.json();

    console.log('Current reservations:', reservations); // Log current reservations

    // Determine the next reservation ID
    const lastId = reservations.length > 0 ? reservations[reservations.length - 1]._id : null;
    const newId = lastId ? `res_${parseInt(lastId.split('_')[1]) + 1}` : 'res_1'; // Increment the ID
    console.log('New reservation ID:', newId); // Log the new ID

    // Add the new ID to the payment data
    data._id = newId;

    // Send the new reservation data
    const postResponse = await fetch('/book/data/Reservations.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!postResponse.ok) {
      throw new Error('Failed to submit reservation');
    }

    const result = await postResponse.json();
    console.log('Reservation added:', result); // Log the result
    alert('Reservation successful! Your booking ID is: ' + newId); // Alert user on success
  } catch (error) {
    console.error('Error submitting reservation:', error);
    alert('There was an error processing your reservation. Please try again.'); // Alert user on error
  }
}

// Function to get the current logged-in user's ID
function getCurrentUserId() {
  const userId = sessionStorage.getItem('userid');
  console.log(`userId: ${userId}`);
  return userId || null;
}
