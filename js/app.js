new Vue({
    el: '#app',
    data: {
        startTime: 8.75, // Start at 8:45 AM
        endTime: 18,     // End at 6:00 PM
        bookedSlots: [
            { start: 5, end: 7 },   // Example of booked slots
            { start: 14, end: 15 },
            { start: 20, end: 22 }
        ],
        overlaps: false, // Boolean to track overlap
        slider: null,    // Placeholder for the slider instance
    },
    mounted() {
        this.createSlider();
        this.updateBookedTimes(); // Show booked times in the bar
    },
    methods: {
        createSlider() {
            this.slider = noUiSlider.create(document.getElementById('slider'), {
                start: [this.startTime, this.endTime],  // Two handles
                connect: [false, true, false],          // Connect two handles
                range: {
                    min: 0,
                    max: 24
                },
                step: 0.25, // Set intervals of 15 minutes
                tooltips: [{ to: this.formatTooltip }, { to: this.formatTooltip }],  // Correct format for tooltips
            });
            this.slider.on('update', () => {
                const tooltips = document.querySelectorAll('.noUi-tooltip');
                if (tooltips.length === 2) {
                    // Apply class to the second tooltip (end handle)
                    tooltips[1].classList.add('end-tooltip');
                }
            });

            this.slider.on('update', (values, handle) => {
                if (handle === 0) this.startTime = +values[0];
                if (handle === 1) this.endTime = +values[1];
                this.checkOverlap();  // Check for overlaps when the slider is moved
            });
        },
        updateSliderFromInputs() {
            this.slider.set([this.startTime, this.endTime]);
            this.checkOverlap();
        },
        checkOverlap() {
            // Check if the selected time range overlaps with any booked slots
            this.overlaps = this.bookedSlots.some(slot =>
                (this.startTime < slot.end && this.endTime > slot.start)
            );

            // Access the connect elements of the slider
            const connectElements = document.querySelectorAll('.noUi-connect');

            // Update slider connection color based on overlap status
            if (this.overlaps) {
                connectElements.forEach(connect => {
                    connect.style.background = '#999999'; // Change the color to red
                });
            } else {
                connectElements.forEach(connect => {
                    connect.style.background = '#C7FDE9'; // Change the color to green
                });
            }
        },
        updateBookedTimes() {
            const bookedBar = document.getElementById('booked-time-bar');
            bookedBar.innerHTML = '';  // Clear any previous slots

            const fullDay = 24;

            // Add booked slots (red) to the bar
            this.bookedSlots.forEach(slot => {
                const bookedSlot = document.createElement('div');
                bookedSlot.className = 'booked-slot';
                bookedSlot.style.left = `${(slot.start / fullDay) * 100}%`;
                bookedSlot.style.width = `${((slot.end - slot.start) / fullDay) * 100}%`;
                bookedBar.appendChild(bookedSlot);
            });

            // Add available time slots (green) to the bar
            let lastEnd = 0;
            this.bookedSlots.forEach(slot => {
                if (lastEnd < slot.start) {
                    const availableSlot = document.createElement('div');
                    availableSlot.className = 'available-slot';
                    availableSlot.style.left = `${(lastEnd / fullDay) * 100}%`;
                    availableSlot.style.width = `${((slot.start - lastEnd) / fullDay) * 100}%`;
                    bookedBar.appendChild(availableSlot);
                }
                lastEnd = slot.end;
            });

            // Add green slot after the last booked slot if necessary
            if (lastEnd < fullDay) {
                const availableSlot = document.createElement('div');
                availableSlot.className = 'available-slot';
                availableSlot.style.left = `${(lastEnd / fullDay) * 100}%`;
                availableSlot.style.width = `${((fullDay - lastEnd) / fullDay) * 100}%`;
                bookedBar.appendChild(availableSlot);
            }
        },
        // Utility function to convert decimal to time format (HH:MM)
        formatTime(value) {
            // Fix floating-point issues by rounding to two decimal places
            value = Math.round(value * 100) / 100;

            const hours = Math.floor(value);
            const minutes = (value - hours) * 60;
            const formattedMinutes = minutes === 0 ? '00' : minutes < 10 ? '0' + minutes : Math.round(minutes);

            return hours.toString().padStart(2, '0') + ':' + formattedMinutes;
        },
        // Format tooltip as time
        formatTooltip(value) {
            return this.formatTime(+value);
        }
    },
    computed: {
        formattedStartTime() {
            return this.formatTime(this.startTime);
        },
        formattedEndTime() {
            return this.formatTime(this.endTime);
        }
    }
});
