class Timer {
    BAR_SIZE=30;                                        // Character length of the progress bar
    FINISH_TEXT=["Time is Up!",
                 "Round has finished.",
                 "No more time left.",
                 "Finito.",
                 "Fin."
                ];                                      // Random sayings to display upon expiration of the timer

    constructor(time_len, interval_sec, message,  text) {
        this.MAX_TIME=Math.floor(time_len);             // Length of the initial Timer in Seconds
        this.DEC_INTV=Math.floor(interval_sec);         // Value to decrement the timer by in Seconds
        this.DISP_TEXT=text;                            // Text to display with the progress bar
        this.MESSAGE=message;                           // Initical message that started the trivia game
        this.ID;                                        // Timer ID
        this.time_left=Math.floor(time_len);            // Time Remaining for the timer
        this.systemInterval=null;                       // null variable to hold reference to systemInterval
        this.INTV_LEN=Math.floor(interval_sec)*1000;    // Interval length to pass to setTimeout
    }

    // Create the progress bar to display
    makeBar(time) {
        const percentage = time / this.MAX_TIME;
        const progress = Math.round((this.BAR_SIZE * percentage));
        const emptyProgress = this.BAR_SIZE - progress;
        const progressText = '▇'.repeat(progress);
        const emptyProgressText = ' '.repeat(emptyProgress);
        const bar = '```'+this.DISP_TEXT+'\n'+progressText + emptyProgressText+'```';
        return bar;
    }

    // Return a random phrase from the FINISH_TEXT array
    finish() {
        let finish = this.FINISH_TEXT[Math.floor(Math.random()*this.FINISH_TEXT.length)];
        return "```"+finish+"```";
    }

    // Update the progress bar message, used in the setInterval call
    update(progress_bar) {
        this.time_left -= this.DEC_INTV;
        
        if (this.time_left <=0) {
            progress_bar.edit( this.finish() );
            clearInterval(this.systemInterval);
        } else {
            progress_bar.edit( this.makeBar(this.time_left) );
        }
    }

    // Start the timer with progress bar
     start() {

        // Create the message then, use setInterval to update the message
        this.MESSAGE.channel.send(this.makeBar(this.TIME_LEFT)).then( embed => { 
            this.systemInterval = setInterval(this.update.bind(this), this.INTV_LEN, embed);
        });
    }
}

module.exports.Timer = Timer;
