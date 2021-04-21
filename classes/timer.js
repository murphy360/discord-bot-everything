class Timer {
    BAR_SIZE = 30;                                      // Character length of the progress bar
    FINISH_TEXT = ['Time is Up!',
                   'Round has finished.',
                   'No more time left.',
                   'Finito.',
                   'Fin.'
                  ];                                    // Random sayings to display upon expiration of the timer

    constructor(time_len, interval_sec, channel,  text) {
        this.ID;                                        // Timer ID
        this.MAX_TIME = Math.floor(time_len);           // Length of the initial timer in Seconds
        this.DEC_INTV = Math.floor(interval_sec);       // Value to decrement the timer by in Seconds
        this.INTV_LEN = Math.floor(interval_sec) * 1000;// Interval length to pass to setTimeout
        this.CHANNEL = channel;                         // Channel in which the trivia game is running
        this.DISP_TEXT = text;                          // Text to display with the progress bar

        this.timeLeft = Math.floor(time_len);           // Time remaining for the timer
        this.systemInterval = null;                     // null variable to hold reference to systemInterval
        this.message = null;                            // Reference to the timer message
    }

    // Create the progress bar to display
    makeBar() {
        const percentage = this.timeLeft / this.MAX_TIME;
        const progress = Math.round((this.BAR_SIZE * percentage));
        const emptyProgress = this.BAR_SIZE - progress;
        const progressText = '▇'.repeat(progress);
        const emptyProgressText = ' '.repeat(emptyProgress);
        const bar = '```' + this.DISP_TEXT + '\n' + progressText + emptyProgressText + '```';
        return bar;
    }

    // Return a random phrase from the FINISH_TEXT array
    finish() {
        let finish = this.FINISH_TEXT[Math.floor((Math.random() * this.FINISH_TEXT.length))];
        return '```' + finish + '```';
    }

    // Cancel the Timer
    cancel() {
        this.message.edit('Timer cancelled.');
        clearInterval(this.systemInterval);
    }

    // Update the progress bar message, used in the setInterval call
    update() {
        this.timeLeft -= this.DEC_INTV;
        
        if (this.timeLeft <= 0) {
            this.message.edit(this.finish());
            clearInterval(this.systemInterval);
        } else {
            this.message.edit(this.makeBar());
        }
    }

    // Start the timer with progress bar, create message and start updating
    start() {
        this.CHANNEL.send(this.makeBar()).then( msg => { 
            this.message = msg;
            this.systemInterval = setInterval(this.update.bind(this), this.INTV_LEN);
        });
    }
}

module.exports.Timer = Timer;
