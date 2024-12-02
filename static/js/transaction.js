// transactionHistory.js

async function fetchReservations() {
  try {
    const response = await fetch('/data/Reservations.json');
    if (!response.ok) {
      throw new Error('Failed to fetch reservations');
    }

    const reservations = await response.json();
    displayReservations(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    alert('Error fetching transaction history. Please try again later.');
  }
}

function displayReservations(reservations) {
  const tableBody = document.getElementById('transactionTable').querySelector('tbody');
  tableBody.innerHTML = '';

  reservations.forEach((reservation) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${reservation._id}</td>
            <td>${reservation.user_id}</td>
            <td>${reservation.parkId}</td>
            <td>${reservation.date}</td>
            <td>${reservation.duration}</td>
            <td>${new Date(reservation.booktime).toLocaleString()}</td>
            <td>${reservation.payment_status}</td>
            <td>${reservation.comment || 'N/A'}</td>
        `;
    tableBody.appendChild(row);
  });
}

window.onload = fetchReservations;
