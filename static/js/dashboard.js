let events = [];

// Function to fetch events from the server
async function fetchEvents() {
  try {
    const response = await fetch('/data/events.json');
    if (!response.ok) throw new Error('Network response was not ok');
    events = await response.json();
    console.log('Fetching events:', events);
    displayEvents(events); // Display all events initially
  } catch (error) {
    console.error('Error fetching events:', error);
  }
}

// Function to display events in the table
function displayEvents(eventsToDisplay) {
  const eventList = document.getElementById('eventList');
  eventList.innerHTML = '';

  eventsToDisplay.forEach((event) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${event.name}</td>
            <td>${new Date(event.start_date).toLocaleDateString()}</td>
            <td>${new Date(event.end_date).toLocaleDateString()}</td>
            <td>${(event.discount * 100).toFixed(0)}%</td>
            <td>${event.description}</td>
        `;
    eventList.appendChild(row);
  });
}

// Main function to initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
  fetchEvents(); // Fetch events when the script loads

  // Search Functionality
  document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const filteredEvents = events.filter((event) => event.description.toLowerCase().includes(searchTerm));
    displayEvents(filteredEvents); // Display filtered events
  });
});
