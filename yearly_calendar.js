document.addEventListener('DOMContentLoaded', function() {
    const yearGrid = document.getElementById('year-grid');
    const yearLabel = document.getElementById('year-label');
    const prevYearBtn = document.getElementById('prev-year');
    const nextYearBtn = document.getElementById('next-year');
    const todayButton = document.getElementById('today-button');
    const themeToggle = document.getElementById('theme-toggle');
    const showWeekNumbers = document.getElementById('show-week-numbers');

    // Safe parsing of query parameters
    function getYearFromQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const yearParam = urlParams.get('year');
        
        // If there's a year parameter, parse and validate it
        if (yearParam) {
            const parsedYear = parseInt(yearParam, 10);
            // Validate reasonable year range (1900-2100)
            if (!isNaN(parsedYear) && parsedYear >= 1900 && parsedYear <= 2100) {
                return parsedYear;
            }
            console.error('Invalid year parameter:', yearParam);
        }
        
        // Default to current year
        return new Date().getFullYear();
    }
    
    // Get theme from query params with validation
    function getThemeFromQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const themeParam = urlParams.get('theme');
        
        // Only accept 'light' or 'dark'
        if (themeParam === 'light' || themeParam === 'dark') {
            return themeParam;
        }
        
        return null; // Use default from local storage
    }

    // Get week numbers from query params with validation
    function getWeekNumbersFromQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const weekNumbersParam = urlParams.get('weekNumbers');
        
        // Only accept 'true' or 'false' string values
        return weekNumbersParam === 'true';
    }

    let currentYear = getYearFromQueryParams();
    let currentMonth = new Date().getMonth();
    
    // Load saved preferences
    loadPreferences();
    
    // Override with URL parameters if provided
    const urlTheme = getThemeFromQueryParams();
    if (urlTheme) {
        if (urlTheme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.textContent = '☀️';
        } else {
            document.body.classList.remove('light-theme');
            themeToggle.textContent = '🌙';
        }
    }
    
    // Apply week numbers from URL parameter if provided
    const urlWeekNumbers = getWeekNumbersFromQueryParams();
    if (urlWeekNumbers) {
        showWeekNumbers.classList.add('active');
    }
    
    // Initialize the calendar
    renderCalendar(currentYear);
    
    // Event Listeners
    prevYearBtn.addEventListener('click', () => {
        currentYear--;
        renderCalendar(currentYear);
    });
    
    nextYearBtn.addEventListener('click', () => {
        currentYear++;
        renderCalendar(currentYear);
    });
    
    todayButton.addEventListener('click', () => {
        currentYear = new Date().getFullYear();
        renderCalendar(currentYear);
        // Scroll to current month
        const currentMonthEl = document.querySelector(`.month[data-month="${currentMonth}"]`);
        if (currentMonthEl) {
            currentMonthEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isDarkTheme = !document.body.classList.contains('light-theme');
        themeToggle.textContent = isDarkTheme ? '🌙' : '☀️';
        savePreferences();
    });
    
    showWeekNumbers.addEventListener('click', () => {
        showWeekNumbers.classList.toggle('active');
        renderCalendar(currentYear);
        savePreferences();
    });
    
    // Functions
    function renderCalendar(year) {
        // Validate year parameter
        if (typeof year !== 'number' || year < 1900 || year > 2100) {
            console.error('Invalid year parameter for rendering:', year);
            year = new Date().getFullYear();
        }
        
        yearGrid.innerHTML = '';
        yearLabel.textContent = year;
        
        const showWeekNums = showWeekNumbers.classList.contains('active');
        
        for (let month = 0; month < 12; month++) {
            const monthDiv = document.createElement('div');
            monthDiv.className = 'month';
            monthDiv.dataset.month = month;
            
            const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
            const monthHeader = document.createElement('div');
            monthHeader.className = 'month-name';
            monthHeader.textContent = monthName;
            monthDiv.appendChild(monthHeader);
            
            const daysGrid = document.createElement('div');
            daysGrid.className = showWeekNums ? 'days-grid with-week-numbers' : 'days-grid';
            
            // Add day initials (Mon, Tue, etc.)
            const dayInitials = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
            if (showWeekNums) {
                const weekLabel = document.createElement('div');
                weekLabel.className = 'week-label';
                weekLabel.textContent = '#';
                daysGrid.appendChild(weekLabel);
            }
            
            dayInitials.forEach(day => {
                const dayInitial = document.createElement('div');
                dayInitial.className = 'day-initial';
                dayInitial.textContent = day;
                daysGrid.appendChild(dayInitial);
            });
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const prevMonthDays = new Date(year, month, 0).getDate();
            
            // Adjust for Monday as first day (0 = Monday, 6 = Sunday)
            const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
            
            let currentWeek = getWeekNumber(new Date(year, month, 1));
            
            // Add empty cells for previous month days
            if (showWeekNums) {
                const weekNum = document.createElement('div');
                weekNum.className = 'week-number';
                weekNum.textContent = currentWeek;
                daysGrid.appendChild(weekNum);
            }
            
            for (let i = 0; i < adjustedFirstDay; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'day prev-month';
                const prevDay = prevMonthDays - (adjustedFirstDay - 1 - i);
                emptyDay.textContent = prevDay;
                daysGrid.appendChild(emptyDay);
            }
            
            // Add days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();
                
                // Add week number at the beginning of each week (Monday)
                if ((day === 1 || dayOfWeek === 1) && day !== 1 && showWeekNums) {
                    currentWeek = getWeekNumber(date);
                    const weekNum = document.createElement('div');
                    weekNum.className = 'week-number';
                    weekNum.textContent = currentWeek;
                    daysGrid.appendChild(weekNum);
                }
                
                const dayCell = document.createElement('div');
                dayCell.className = 'day';
                dayCell.textContent = day;
                
                // Check if this day is today
                if (year === new Date().getFullYear() && month === new Date().getMonth() && day === new Date().getDate()) {
                    dayCell.classList.add('today');
                }
                
                daysGrid.appendChild(dayCell);
            }
            
            // Add empty cells for next month
            const totalCells = showWeekNums ? 7 * Math.ceil((adjustedFirstDay + daysInMonth) / 7) : adjustedFirstDay + daysInMonth;
            const cellsToAdd = showWeekNums ? 7 - ((totalCells - 1) % 7 + 1) : 7 - (totalCells % 7);
            
            if (cellsToAdd < 7) {
                for (let i = 1; i <= cellsToAdd; i++) {
                    const emptyDay = document.createElement('div');
                    emptyDay.className = 'day next-month';
                    emptyDay.textContent = i;
                    daysGrid.appendChild(emptyDay);
                }
            }
            
            monthDiv.appendChild(daysGrid);
            yearGrid.appendChild(monthDiv);
        }
        
        // Add animation effect
        yearGrid.classList.add('slide-in');
        setTimeout(() => {
            yearGrid.classList.remove('slide-in');
        }, 500);
    }
    
    function savePreferences() {
        const preferences = {
            theme: document.body.classList.contains('light-theme') ? 'light' : 'dark',
            showWeekNumbers: showWeekNumbers.classList.contains('active')
        };
        
        localStorage.setItem('yearlyCalendarPrefs', JSON.stringify(preferences));
    }
    
    function loadPreferences() {
        const preferences = JSON.parse(localStorage.getItem('yearlyCalendarPrefs') || '{}');
        
        if (preferences.theme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.textContent = '☀️';
        }
        
        if (preferences.showWeekNumbers) {
            showWeekNumbers.classList.add('active');
        }
    }
    
    function getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
});
