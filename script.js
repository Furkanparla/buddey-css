document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date(2025, 2); // maart 2025
    let selectedDate = null;
    let selectedSlots = new Map(); // datum -> [tijdsloten]
    let totalSelectedSlots = 0;

    const weekDays = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    const monthNames = [
        "januari", "februari", "maart", "april", "mei", "juni",
        "juli", "augustus", "september", "oktober", "november", "december"
    ];

    // DOM elementen
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');
    const selectedSlotsList = document.getElementById('selectedSlotsList');
    const timeslotOptions = document.getElementById('timeslotOptions');
    const timeslotsWrapper = document.querySelector('.timeslots-wrapper');
    const notification = document.getElementById('notification');
    const timeslotHeader = document.querySelector('.timeslot-header');

    // Navigatie knoppen
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    function showNotification(message) {
        const notificationText = document.getElementById('notificationText');
        notificationText.textContent = message;
        notification.classList.remove('hide');
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hide');
            setTimeout(() => {
                notification.classList.remove('hide');
            }, 300);
        }, 3000);
    }

    function getWeekDay(date) {
        return weekDays[new Date(date).getDay()];
    }

    function formatDate(date) {
        return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }

    function formatDisplayDate(dateString) {
        const [day, month, year] = dateString.split(' ');
        const date = new Date(year, monthNames.indexOf(month), parseInt(day));
        return `${getWeekDay(date)} ${day} ${month} ${year}`;
    }

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        currentMonthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        let firstDayOfWeek = firstDay.getDay() || 7;
        for (let i = 1; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day disabled';
            calendarGrid.appendChild(emptyDay);
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            const dateString = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            
            if (selectedSlots.has(dateString)) {
                dayElement.classList.add('has-slots');
            }

            dayElement.addEventListener('click', () => handleDateSelection(dateString));
            calendarGrid.appendChild(dayElement);
        }
    }

    function handleDateSelection(dateString) {
        selectedDate = dateString;
        
        // Update kalender selectie
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
            const dayDate = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(day.textContent)));
            
            if (dayDate === dateString) {
                day.classList.add('selected');
            }
            
            // Update has-slots class voor dagen met geselecteerde tijdsloten
            if (selectedSlots.has(dayDate)) {
                day.classList.add('has-slots');
            } else {
                day.classList.remove('has-slots');
            }
        });

        // Toon tijdslot sectie
        timeslotsWrapper.style.display = 'block';
        timeslotsWrapper.classList.add('active');
        timeslotHeader.classList.remove('disabled');
        
        // Reset alle tijdslot opties naar niet-geselecteerde staat
        document.querySelectorAll('.timeslot-option').forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            
            // Reset eerst alle states
            checkbox.checked = false;
            checkbox.disabled = false;
            option.classList.remove('disabled');
            
            // Check of dit tijdslot is geselecteerd voor deze dag
            if (selectedSlots.has(dateString) && selectedSlots.get(dateString).includes(checkbox.id)) {
                checkbox.checked = true;
            }
        });

        timeslotHeader.textContent = 'Selecteer beschikbare tijden';
    }

    function updateTimeslotOptions() {
        const options = document.querySelectorAll('.timeslot-option');
        
        options.forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            
            // Verwijder de oude event listener
            option.onclick = null;
            
            // Voeg nieuwe event listener toe
            option.addEventListener('click', function() {
                if (checkbox.checked) {
                    // Direct deselecteren
                    checkbox.checked = false;
                    
                    // Verwijder tijdslot uit de selecties
                    if (selectedSlots.has(selectedDate)) {
                        const slots = selectedSlots.get(selectedDate).filter(slot => slot !== checkbox.id);
                        if (slots.length === 0) {
                            selectedSlots.delete(selectedDate);
                        } else {
                            selectedSlots.set(selectedDate, slots);
                        }
                        totalSelectedSlots--;
                        
                        // Update UI na verwijdering
                        updateUI();
                    }
                } else {
                    // Direct selecteren
                    checkbox.checked = true;
                    
                    // Voeg tijdslot toe aan selecties
                    const slots = selectedSlots.get(selectedDate) || [];
                    if (!slots.includes(checkbox.id)) {
                        slots.push(checkbox.id);
                        selectedSlots.set(selectedDate, slots);
                        totalSelectedSlots++;
                        
                        // Update UI na toevoeging
                        updateUI();
                    }
                }
            });
        });
    }

    function updateUI() {
        // Update tijdslot opties voor de geselecteerde dag
        document.querySelectorAll('.timeslot-option').forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            const isSelected = selectedSlots.has(selectedDate) && 
                             selectedSlots.get(selectedDate).includes(checkbox.id);
            
            // Update checkbox status
            checkbox.checked = isSelected;
        });

        // Update kalender met has-slots markering
        document.querySelectorAll('.calendar-day').forEach(day => {
            if (day.textContent) {
                const dayDate = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(day.textContent)));
                if (selectedSlots.has(dayDate)) {
                    day.classList.add('has-slots');
                } else {
                    day.classList.remove('has-slots');
                }
                
                // Update selected state voor de actieve dag
                if (dayDate === selectedDate) {
                    day.classList.add('selected');
                } else {
                    day.classList.remove('selected');
                }
            }
        });

        // Update geselecteerde tijdsloten lijst
        selectedSlotsList.innerHTML = '';
        selectedSlots.forEach((slots, date) => {
            slots.forEach(slot => {
                const slotElement = document.createElement('div');
                slotElement.className = 'selected-slot-item';
                
                const dateElement = document.createElement('div');
                dateElement.className = 'date';
                dateElement.textContent = formatDisplayDate(date);
                
                const timeElement = document.createElement('div');
                timeElement.className = 'time';
                const timeRanges = {
                    'ochtend': '08:00 - 12:00',
                    'middag': '12:00 - 18:00',
                    'avond': '18:00 - 21:00'
                };
                timeElement.textContent = `${capitalizeFirstLetter(slot)}: ${timeRanges[slot]}`;
                
                const removeButton = document.createElement('button');
                removeButton.innerHTML = '×';
                removeButton.className = 'remove-button';
                removeButton.setAttribute('aria-label', 'Verwijder selectie');
                removeButton.onclick = (e) => {
                    e.stopPropagation();
                    
                    // Update checkbox status direct
                    const checkbox = document.querySelector(`#${slot}`);
                    if (checkbox) checkbox.checked = false;
                    
                    // Verwijder tijdslot
                    const updatedSlots = selectedSlots.get(date).filter(s => s !== slot);
                    if (updatedSlots.length === 0) {
                        selectedSlots.delete(date);
                    } else {
                        selectedSlots.set(date, updatedSlots);
                    }
                    totalSelectedSlots--;
                    updateUI();
                };

                slotElement.appendChild(dateElement);
                slotElement.appendChild(timeElement);
                slotElement.appendChild(removeButton);
                selectedSlotsList.appendChild(slotElement);
            });
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Initiële setup
    function init() {
        renderCalendar();
        updateTimeslotOptions();
        
        // Verberg tijdslot sectie bij start
        timeslotsWrapper.style.display = 'none';
        timeslotHeader.classList.add('disabled');
        timeslotHeader.textContent = 'Selecteer eerst een datum om tijden te kiezen';
    }

    init();
}); 