class Timer {
    BAR_SIZE=30                                // Character length of the progress bar
    id                                         // Timer id
    FINISH_TEXT=["Time is Up!",
                          "Round has finished.",
                          "Pencils down.",
                          "No more time left.",
                          "Finito",
                          "Fin"
                 ]                              // Random sayings to dispaly upon expiration of the timer

    constructor(time_len, interval_sec, message,  text) {
        this.MAX_TIME=Math.floor(time_len)              // Length of the initial Timer
        this.DEC_INT=Math.floor(interval_sec)           // Value to decrement the timer by in Seconds
        this.DISP_TEXT=text                             // Text to display with the progress bar
        this.MESSAGE=message                            // Initical message that started the trivia game
    }

    makeBar(time) {
        const percentage = time / this.MAX_TIME;
        const progress = Math.round((this.BAR_SIZE * percentage));
        const emptyProgress = this.BAR_SIZE - progress;
        const progressText = '▇'.repeat(progress);
        const emptyProgressText = ' '.repeat(emptyProgress);
        const bar = progressText + emptyProgressText;

        return bar;
    }

    start() {
        var timer_len=this.MAX_TIME;
        
        let pBar = function(theBarEmbed) {
            timer_len-=this.DEC_INT;

            if (timer_len == 0) {
                theBarEmbed.edit("```"+this.FINISH_TEXT[Math.floor(Math.random() * this.FINISH_TEXT.length)]+"```");
                clearInterval(this.p)
                return;
            } else {
                theBarEmbed.edit(this.DISP_TEXT+"\n"+this.makeBar(timer_len));
            }
        }

        let intv=this.DEC_INT*1000;
        this.MESSAGE.channel.send("```"+this.DISP_TEXT+"\n"+this.makeBar(timer_len)+"```").then(embed => { this.p = setInterval(pBar,intv,embed) });
    }

}

module.exports.Timer = Timer;

