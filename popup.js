document.addEventListener('DOMContentLoaded', function () {
  // Current date for calendar
  let currentDate = new Date();
  
  // App state (will be saved to storage)
  let appState = {
    theme: 'dark',
    showWeekNumbers: false,
    timezone: 'local'
  };
  
  // Load saved state from storage
  browser.storage.local.get('dateTimeState').then(result => {
    if (result.dateTimeState) {
      appState = {...appState, ...result.dateTimeState};
      applyAppState();
    }
  }).catch(err => console.error('Error loading state:', err));
  
  // Apply the app state
  function applyAppState() {
    // Apply theme
    if (appState.theme === 'light') {
      document.body.classList.add('light-theme');
      document.getElementById('theme-toggle').textContent = '☀️';
    } else {
      document.body.classList.remove('light-theme');
      document.getElementById('theme-toggle').textContent = '🌙';
    }
    
    // Apply week numbers
    const showWeekNumbersBtn = document.getElementById('show-week-numbers');
    if (appState.showWeekNumbers) {
      showWeekNumbersBtn.classList.add('active');
    } else {
      showWeekNumbersBtn.classList.remove('active');
    }
    
    // Apply timezone
    document.getElementById('timezone-selector').value = appState.timezone;
    
    // Update UI with current state
    updateDateTime();
    updateMonthlyCalendar(currentDate);
  }
  
  // Save app state to storage
  function saveAppState() {
    browser.storage.local.set({
      dateTimeState: appState
    }).catch(err => console.error('Error saving state:', err));
  }
  
  // Initialize the UI
  setInterval(updateDateTime, 1000);
  updateDateTime();
  updateMonthlyCalendar(currentDate);
  
  // Button to open the yearly calendar in a new window
  const openYearlyCalendarButton = document.getElementById('open-yearly-calendar');
  openYearlyCalendarButton.addEventListener('click', openYearlyCalendar);
  
  // Month navigation
  const prevMonthButton = document.getElementById('prev-month');
  const nextMonthButton = document.getElementById('next-month');
  const todayButton = document.getElementById('today-button');
  
  prevMonthButton.addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    updateMonthlyCalendar(currentDate);
  });
  
  nextMonthButton.addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    updateMonthlyCalendar(currentDate);
  });
  
  todayButton.addEventListener('click', () => {
    currentDate = new Date();
    updateMonthlyCalendar(currentDate);
  });
  
  // Theme toggle
  const themeToggleButton = document.getElementById('theme-toggle');
  themeToggleButton.addEventListener('click', () => {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    applyAppState();
    saveAppState();
  });
  
  // Week numbers toggle
  const weekNumbersButton = document.getElementById('show-week-numbers');
  weekNumbersButton.addEventListener('click', () => {
    appState.showWeekNumbers = !appState.showWeekNumbers;
    applyAppState();
    saveAppState();
  });
  
  // Timezone selector
  const timezoneSelector = document.getElementById('timezone-selector');
  timezoneSelector.addEventListener('change', () => {
    appState.timezone = timezoneSelector.value;
    updateDateTime();
    saveAppState();
  });
});

// Helper function: Get week number for a date (ISO 8601 standard)
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Helper function: Format date in timezone
function formatInTimezone(date, timezone) {
  if (timezone === 'local') {
    return date;
  }
  
  // Create a copy of the date
  const newDate = new Date(date.getTime());
  
  if (timezone === 'UTC') {
    // Adjust for UTC
    const offset = date.getTimezoneOffset();
    newDate.setMinutes(date.getMinutes() + offset);
    return newDate;
  } else {
    // Parse GMT offset (e.g., "GMT-8" or "GMT+5.5")
    const match = timezone.match(/^GMT([+-])(\d{1,2})(?:\.(\d+))?$/);
    if (match) {
      const sign = match[1] === '+' ? 1 : -1;
      const hours = parseInt(match[2], 10);
      
      // Validate hours
      if (hours > 23) {
        console.error('Invalid timezone hours:', hours);
        return date;
      }
      
      const minutes = match[3] ? parseFloat('0.' + match[3]) * 60 : 0; // Convert decimal to minutes
      
      // Validate minutes
      if (minutes > 59) {
        console.error('Invalid timezone minutes:', minutes);
        return date;
      }
      
      // Get local timezone offset in minutes
      const localOffset = date.getTimezoneOffset();
      
      // Calculate target timezone in minutes from UTC
      const targetOffset = sign * (hours * 60 + minutes);
      
      // Adjust date: subtract local offset and add target offset
      newDate.setMinutes(date.getMinutes() + localOffset + targetOffset);
      return newDate;
    }
    console.error('Invalid timezone format:', timezone);
    return date;
  }
}

function updateDateTime() {
  const datetimeElement = document.getElementById('datetime');
  const now = new Date();
  
  // Get app state for timezone
  let timezone = 'local';
  try {
    const timezoneSelector = document.getElementById('timezone-selector');
    timezone = timezoneSelector.value;
  } catch (e) {
    console.error('Error getting timezone:', e);
  }
  
  // Format date with timezone
  const adjustedDate = formatInTimezone(now, timezone);
  
  // Format date with options
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateString = adjustedDate.toLocaleDateString('en-US', options);
  
  // Format time with AM/PM
  const timeString = adjustedDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric', 
    hour12: true 
  });
  
  // Add timezone indicator
  let timezoneString = '';
  if (timezone !== 'local') {
    timezoneString = `<div class="timezone-indicator">${timezone}</div>`;
  }
  
  // Update the content with animation
  datetimeElement.innerHTML = `<div>${dateString}</div><div class="time">${timeString}</div>${timezoneString}`;
}

function updateMonthlyCalendar(date) {
  const monthYearElement = document.getElementById('month-year');
  const calendarGrid = document.getElementById('calendar-grid');
  const dayNamesElement = document.getElementById('day-names');
  
  // Get app state
  let showWeekNumbers = false;
  try {
    const weekNumbersBtn = document.getElementById('show-week-numbers');
    showWeekNumbers = weekNumbersBtn.classList.contains('active');
  } catch (e) {
    console.error('Error checking week number state:', e);
  }
  
  // Add animation class
  calendarGrid.classList.add('fade-in');
  
  // Set month and year label with fancy formatting
  monthYearElement.textContent = date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Clear existing content
  dayNamesElement.innerHTML = '';
  calendarGrid.innerHTML = '';

  // Apply week numbers to grid if enabled
  if (showWeekNumbers) {
    // Add week number header
    const weekNumberHeader = document.createElement('div');
    weekNumberHeader.className = 'week-label';
    weekNumberHeader.textContent = 'Wk';
    dayNamesElement.appendChild(weekNumberHeader);
    
    // Tell the calendar grid to adjust columns
    calendarGrid.classList.add('with-week-numbers');
    dayNamesElement.classList.add('with-week-numbers');
  } else {
    calendarGrid.classList.remove('with-week-numbers');
    dayNamesElement.classList.remove('with-week-numbers');
  }
  
  // Set day names (shorter abbreviations) - Monday start
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  dayNames.forEach(day => {
    const dayName = document.createElement('div');
    dayName.textContent = day;
    dayNamesElement.appendChild(dayName);
  });
  
  // Get first day of month and days in month
  const today = new Date();
  let startDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  
  // Adjust for Monday as first day (0 = Monday, 6 = Sunday)
  startDay = startDay === 0 ? 6 : startDay - 1;
  
  // Calculate the week number for the first day of the month
  let currentWeek = getWeekNumber(new Date(date.getFullYear(), date.getMonth(), 1));
  
  // Add week number if enabled
  if (showWeekNumbers) {
    const weekNumberCell = document.createElement('div');
    weekNumberCell.className = 'week-number';
    weekNumberCell.textContent = currentWeek;
    calendarGrid.appendChild(weekNumberCell);
  }
  
  // Add empty cells for days before the start of the month
  for (let i = 0; i < startDay; i++) {
    calendarGrid.appendChild(document.createElement('div'));
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    // Add week number at the beginning of each week
    if (showWeekNumbers && ((startDay + day - 1) % 7 === 0) && day > 1) {
      currentWeek++;
      const weekNumberCell = document.createElement('div');
      weekNumberCell.className = 'week-number';
      weekNumberCell.textContent = currentWeek;
      calendarGrid.appendChild(weekNumberCell);
    }
    
    const dayElement = document.createElement('div');
    dayElement.textContent = day;
    
    // Check if this day is today
    if (day === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
      dayElement.classList.add('today');
    }
    
    // Add click event to select a day
    dayElement.addEventListener('click', () => {
      // Get all days and remove any selected class
      document.querySelectorAll('#calendar-grid div').forEach(el => {
        if (!el.classList.contains('week-number')) {
          el.classList.remove('selected');
        }
      });
      
      // Add selected class to the clicked day
      if (!dayElement.classList.contains('today')) {
        dayElement.classList.add('selected');
      }
    });
    
    calendarGrid.appendChild(dayElement);
  }
  
  // Remove animation class after animation completes
  setTimeout(() => {
    calendarGrid.classList.remove('fade-in');
  }, 300);
}

function openYearlyCalendar() {
  const year = new Date().getFullYear();
  
  // Get current state to pass to yearly calendar
  let stateParams = '';
  try {
    const timezoneSelector = document.getElementById('timezone-selector');
    const weekNumbersBtn = document.getElementById('show-week-numbers');
    const showWeekNumbers = weekNumbersBtn.classList.contains('active');
    const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    
    // Sanitize timezone value before adding to URL
    const timezone = encodeURIComponent(timezoneSelector.value);
    
    stateParams = `&timezone=${timezone}&weekNumbers=${showWeekNumbers}&theme=${theme}`;
  } catch (e) {
    console.error('Error getting state for yearly calendar:', e);
  }
  
  const yearlyCalendarURL = `yearly_calendar.html?year=${year}${stateParams}`;
  window.open(yearlyCalendarURL, 'Yearly Calendar', 'width=900,height=650');
}
