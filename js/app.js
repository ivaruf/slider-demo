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
                tooltips: true,
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
            this.overlaps = this.bookedSlots.some(slot =>
                (this.startTime < slot.end && this.endTime > slot.start)
            );
        },
        updateBookedTimes() {
            // Get the booked time bar element
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
        }
    }
});
