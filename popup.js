document.addEventListener('DOMContentLoaded', function () {
  setInterval(updateDateTime, 1000);
  updateDateTime();

  // Show monthly calendar by default
  updateMonthlyCalendar(new Date());

  // Button to open the yearly calendar in a new window
  const openYearlyCalendarButton = document.getElementById('open-yearly-calendar');
  openYearlyCalendarButton.addEventListener('click', openYearlyCalendar);
});

function updateDateTime() {
  const datetimeElement = document.getElementById('datetime');
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateString = now.toLocaleDateString('en-US', options);
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
  datetimeElement.innerHTML = `${dateString}<br>${timeString}`;
}

function updateMonthlyCalendar(date) {
  const monthYearElement = document.getElementById('month-year');
  const calendarGrid = document.getElementById('calendar-grid');
  const dayNamesElement = document.getElementById('day-names');

  // Set month and year label
  monthYearElement.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Set day names (Sun, Mon, Tue, etc.)
  dayNamesElement.innerHTML = '';
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
      const dayName = document.createElement('div');
      dayName.textContent = day;
      dayNamesElement.appendChild(dayName);
  });

  // Set days of the month
  calendarGrid.innerHTML = '';
  const startDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  for (let i = 0; i < startDay; i++) {
      calendarGrid.innerHTML += '<div></div>';
  }
  for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.textContent = day;
      if (day === date.getDate()) dayElement.classList.add('today');
      calendarGrid.appendChild(dayElement);
  }
}

function openYearlyCalendar() {
  const year = new Date().getFullYear();
  const yearlyCalendarURL = `yearly_calendar.html?year=${year}`;
  window.open(yearlyCalendarURL, 'Yearly Calendar', 'width=600,height=600');
}
