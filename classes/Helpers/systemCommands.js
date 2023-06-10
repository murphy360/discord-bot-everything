const { Users } = require('./../../dbObjects.js');
const Sequelize = require('sequelize');
Sequelize.options.logging = console.log;
class SystemCommands {


    constructor() {
                
    }

    async getChangeLog() {
        exec(git)
        async function sh(cmd) {
            return new Promise(function (resolve, reject) {
              exec(cmd, (err, stdout, stderr) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({ stdout, stderr });
                }
              });
            });
          }
    }

    
}

module.exports.SystemCommands = SystemCommands;
