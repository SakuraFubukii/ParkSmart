let events = [];
let currentEventId = null; // To keep track of the event being edited

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

async function saveEvents() {
  try {
    const response = await fetch('/event/manage/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(events),
    });

    if (!response.ok) throw new Error('Failed to save events');
  } catch (error) {
    console.error('Error saving events:', error);
  }
}

function displayEvents(eventsToDisplay) {
  const eventList = document.getElementById('eventList');
  eventList.innerHTML = '';

  eventsToDisplay.forEach((event) => {
    const row = document.createElement('tr');
    row.innerHTML = `
              <td>${event.name}</td>
              <td>${new Date(event.start_date).toLocaleDateString()}</td>
              <td>${new Date(event.end_date).toLocaleDateString()}</td>
              <td>${event.discount}</td>
              <td>${event.description}</td>
              <td>
                  <button class="btn btn-warning" onclick="editEvent('${event.id}')">Edit</button>
                  <button class="btn btn-danger" onclick="deleteEvent('${event.id}')">Delete</button>
              </td>
          `;
    eventList.appendChild(row);
  });
}

async function deleteEvent(eventId) {
  const confirmed = window.confirm('Are you sure you want to delete this event?');

  if (confirmed) {
    events = events.filter((event) => event.id !== eventId);
    await saveEvents();
    displayEvents(events); // Update the displayed events
  } else {
    console.log('Deletion canceled');
  }
}

function editEvent(eventId) {
  const eventToEdit = events.find((event) => event.id === eventId);
  if (eventToEdit) {
    currentEventId = eventId; // Set the current event ID for updating

    // Populate the edit form with the existing event data
    document.getElementById('editEventName').value = eventToEdit.name;
    document.getElementById('editEventStartDate').value = eventToEdit.start_date;
    document.getElementById('editEventEndDate').value = eventToEdit.end_date;
    document.getElementById('editEventDiscount').value = eventToEdit.discount;
    document.getElementById('editEventDescription').value = eventToEdit.description || '';

    // Show the edit form and title
    document.getElementById('editEventForm').style.display = 'block';
    document.getElementById('editEventTitle').style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Create Event Form Submission
  document.getElementById('eventForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const name = document.getElementById('eventName').value;
    const startDate = document.getElementById('eventStartDate').value;
    const endDate = document.getElementById('eventEndDate').value;
    const discount = parseFloat(document.getElementById('eventDiscount').value);
    const description = document.getElementById('eventDescription').value || '';

    // Validate required fields
    if (!name || !startDate || !endDate || isNaN(discount)) {
      alert('Please fill in all required fields.');
      return;
    }

    // Create a new event
    const newEvent = {
      id: `promo_${events.length + 1}`,
      name,
      start_date: startDate,
      end_date: endDate,
      discount,
      description,
    };

    events.push(newEvent);
    alert('Event created successfully!');

    await saveEvents();
    displayEvents(events); // Display updated events
    this.reset();
  });

  // Edit Event Form Submission
  document.getElementById('editEventForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const name = document.getElementById('editEventName').value;
    const startDate = document.getElementById('editEventStartDate').value;
    const endDate = document.getElementById('editEventEndDate').value;
    const discount = parseFloat(document.getElementById('editEventDiscount').value);
    const description = document.getElementById('editEventDescription').value || '';

    // Validate required fields
    if (!name || !startDate || !endDate || isNaN(discount)) {
      alert('Please fill in all required fields.');
      return;
    }

    // Update the existing event
    const eventIndex = events.findIndex((event) => event.id === currentEventId);
    if (eventIndex !== -1) {
      events[eventIndex] = {
        id: currentEventId,
        name,
        start_date: startDate,
        end_date: endDate,
        discount,
        description,
      };
      alert('Event updated successfully!');
    }

    await saveEvents();
    displayEvents(events); // Display updated events
    this.reset();
    currentEventId = null; // Reset for future submissions
    document.getElementById('editEventForm').style.display = 'none'; // Hide the edit form
    document.getElementById('editEventTitle').style.display = 'none'; // Hide the edit title
  });

  // Search Functionality
  document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const filteredEvents = events.filter((event) => event.description.toLowerCase().includes(searchTerm));
    displayEvents(filteredEvents); // Display filtered events
  });

  fetchEvents(); // Fetch events when the script loads
});
