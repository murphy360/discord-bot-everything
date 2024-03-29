# Discord Bot for Everything

This bot aims to incorporate a lot of different ideas into one bot. Currently in development for the bot are the following:
 - trivia. Play a trivia game. Trivia questions pulled from [Open Trivia Database](https://theopentdb.com).
 - jokes. Tell random jokes. Jokes are pulled from [https://sv443.net/](https://sv443.net/jokeapi/v2/) and [Dad Jokes API](https://github.com/KegenGuyll/DadJokes)
 - play. Play youtube audio to an audio channel.

This code base was forked from [https://github.com/sitepoint-editors/discord-bot-sitepoint](https://github.com/sitepoint-editors/discord-bot-sitepoint)

## Requirements

- [Node.js](http://nodejs.org/)
- [Discord](https://discordapp.com/) account
- [Sequelize](https://sequelize.org) `npm install --save sequelize`
- [HTML Entities](https://github.com/mathiasbynens/he) `npm install --save he`
- [Youtube Download Core](https://github.com/fent/node-ytdl-core) `npm install --save ytdl-core`
- [Node Fetch](https://github.com/node-fetch/node-fetch) `npm install --save node-fetch`
- [Node Sqlite](https://github.com/kriasoft/node-sqlite) `npm install --save sqlite`

## Installation Steps (Standalone)

1. Clone repo
2. Add Discord credentials (Bot Token) in a `.env` file
3. npm install
4. Install [Requirements listed above](README.md#requirements)
5. apt install ffmpeg
6. Run `node index.js` or `npm run dev` (ensure package.json properly configured)
7. Interact with your Discord bot via your web browser

## Installation Steps (Docker) <--- Needs Tested

1. Clone repo
3. Build Docker Container

4. Load Container

5. Create Volume Mount point on host
- Add Discord credentials (Bot Token) in a `.env` file

## License

SitePoint's code archives and code examples are licensed under the MIT license.

Copyright © 2020 SitePoint

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
