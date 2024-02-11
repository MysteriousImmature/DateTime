document.addEventListener('DOMContentLoaded', function () {
    // Update the date and time every second
    setInterval(updateDateTime, 1000);
  
    // Initial update
    updateDateTime();
  });
  
  function updateDateTime() {
    const datetimeElement = document.getElementById('datetime');
    const now = new Date();
    
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    const datetimeString = now.toLocaleString('en-US', options);
    
    datetimeElement.textContent = datetimeString;
  }
  