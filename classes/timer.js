class Timer {
    BAR_SIZE=30                                         // Character length of the progress bar
    FINISH_TEXT=["Time is Up!",
                 "Round has finished.",
                 "Pencils down.",
                 "No more time left.",
                 "Finito.",
                 "Fin."
                ]                                       // Random sayings to display upon expiration of the timer

    constructor(time_len, interval_sec, message,  text) {
        this.MAX_TIME=Math.floor(time_len)              // Length of the initial Timer in Seconds
        this.DEC_INT=Math.floor(interval_sec)           // Value to decrement the timer by in Seconds
        this.DISP_TEXT=text                             // Text to display with the progress bar
        this.MESSAGE=message                            // Initical message that started the trivia game
        this.ID                                         // Timer ID
        this.TIME_LEFT=Math.floor(time_len)             // Time Remaining for the timer
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


// Start the timer with progress bar
     start() {
        var interval=this.DEC_INT*1000;                 // setInterval timeout
        var int=null                                    // null variable to store the setInterval

    // Update the progress message, to be used int he setInterval call
        let update = function (progress_bar) {
            this.TIME_LEFT -= this.DEC_INT;
            
        // If there is no time left, show the finish text and clear the interval, otherwise update the progress bar
            if (this.TIME_LEFT <=0) {
                progress_bar.edit("```"+this.FINISH_TEXT[Math.floor(Math.random()*this.FINISH_TEXT.length)]+"```");
                clearInterval(int)
                return 0;
           } else {
                progress_bar.edit(this.makeBar(this.TIME_LEFT))
           }
        }
        
    // Create the message then, use setInterval to update the message
        this.MESSAGE.channel.send(this.makeBar(this.TIME_LEFT)).then( embed => { 
            int = setInterval(update.bind(this), interval, embed);
        });
    }

}

module.exports.Timer = Timer;
