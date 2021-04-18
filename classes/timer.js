function makeBar(time, max, size, text) {
    console.info("makeBar: time: "+time+"\nmax: "+max+"\nsize: "+size+"\ntext: "+text)

    const percentage = time / max;
    const progress = Math.round((size * percentage));
    const emptyProgress = size - progress;
    const progressText = '▇'.repeat(progress);
    const emptyProgressText = ' '.repeat(emptyProgress);
    const bar = '```'+text+'\n'+progressText + emptyProgressText+'```';

    return bar;
}

class Timer {
    BAR_SIZE=30                                         // Character length of the progress bar
    FINISH_TEXT=["Time is Up!",
                 "Round has finished.",
                 "Pencils down.",
                 "No more time left.",
                 "Finito",
                 "Fin"
                ]                                       // Random sayings to display upon expiration of the timer

    constructor(time_len, interval_sec, message,  text) {
        this.MAX_TIME=Math.floor(time_len)              // Length of the initial Timer in Seconds
        this.DEC_INT=Math.floor(interval_sec)           // Value to decrement the timer by in Seconds
        this.DISP_TEXT=text                             // Text to display with the progress bar
        this.MESSAGE=message                            // Initical message that started the trivia game
        this.ID                                         // Timer ID
        this.TIME_LEFT=Math.floor(time_len)             // Time Remaining for the timer
    }

/*
    update(time_left, progress_bar) {

        console.info("Update function, time_left: "+time_left)

        if (time_left <= 0)  {
            progress_bar.edit("```"+this.FINISH_TEXT[Math.floor(Math.random()*this.FINISH_TEXT.length)]+"```");
            return 0;
        } else {
            progress_bar.edit(this.makeBar(this.TIME_LEFT, this.MAX_TIME, this.BAR_SIZE, this.DISP_TEXT));
            update
            return 1;
        }
    }
*/

     start() {
        var interval=this.DEC_INT*1000;
        var time=this.TIME_LEFT;
        var int=null
        
        let update = function (progress_bar) {
            time -= this.DEC_INT;
            
            if (time <=0) {
                progress_bar.edit("```"+this.FINISH_TEXT[Math.floor(Math.random()*this.FINISH_TEXT.length)]+"```");
                clearInterval(int)
                return 0;
           } else {
                console.info("calling makeBar("+time+", "+this.MAX_TIME+", "+this.BAR_SIZE+", "+this.DISP_TEXT+") from update")
                progress_bar.edit(makeBar(time, this.MAX_TIME, this.BAR_SIZE, this.DISP_TEXT))
           }
        }
        
        this.MESSAGE.channel.send(makeBar(this.TIME_LEFT, this.MAX_TIME, this.BAR_SIZE, this.DISP_TEXT)).then( embed => { 
                console.info("calling makeBar("+time+", "+this.MAX_TIME+", "+this.BAR_SIZE+", "+this.DISP_TEXT+") from message")

            int = setInterval(update.bind(this), interval, embed);

        });
    }

}

module.exports.Timer = Timer;
