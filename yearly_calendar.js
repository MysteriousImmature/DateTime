document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const year = parseInt(urlParams.get('year'), 10);
    updateYearlyCalendar(year);
});

function updateYearlyCalendar(year) {
    const yearLabel = document.getElementById('year-label');
    const yearGrid = document.getElementById('year-grid');

    yearLabel.textContent = `Year: ${year}`;

    for (let month = 0; month < 12; month++) {
        const monthContainer = document.createElement('div');
        monthContainer.classList.add('month');

        const monthName = document.createElement('div');
        monthName.classList.add('month-name');
        monthName.textContent = new Date(year, month).toLocaleString('en-US', { month: 'long' });

        const daysGrid = document.createElement('div');
        daysGrid.classList.add('days-grid');

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            daysGrid.appendChild(dayElement);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            daysGrid.innerHTML += '<div></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            daysGrid.appendChild(dayElement);
        }

        monthContainer.appendChild(monthName);
        monthContainer.appendChild(daysGrid);
        yearGrid.appendChild(monthContainer);
    }
}
