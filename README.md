# Discord Bot for Everything

This bot aims to incorporate a lot of different ideas into one bot. Currently in development for the bot are the following:
 - trivia. Play a trivia game. Trivia questions pulled from:
 -- [Open Trivia Database](https://theopentdb.com).
 -- [OpenAI](https://openai.com/)

This code base was forked from [https://github.com/sitepoint-editors/discord-bot-sitepoint](https://github.com/sitepoint-editors/discord-bot-sitepoint)

## Dependencies
- Docker

## Installation Steps (Docker)

1. Clone repo
2. Create volume-mapped directory
3. Update .env file (Rename template.env -> .env) and add appropriate variables from Discord Developer Page
4. docker build . -t murphy360/discord-bot-everything
5. docker run -d --name discord_bot -v ~/my-windows-home/Software/GitHub/discord-bot-everything/data/:/usr/src/bot/data docker.io/murphy360/discord-bot-everything


## Docker Compose
This project is hosted on docker hub at: https://hub.docker.com/repository/docker/murphy360/everythingbot
Source for this project is on github at: https://github.com/murphy360/discord-bot-everything 

Tags: 
- latest - Latest Release with a tag in format: /^v([0-9]+)\.([0-9]+)\.([0-9]+)$/
- develop - Latest commit to develop branch
- nightly - Latest commit to main branch (Regardless of TAG)
- release-0 - Latest Major v0.X.X Release
- release-0.5 - Latest Minor v0.5.X Release (Recommended)
- release-0.5.X - Latest Patch Release

version: '3'
services:
        everythingbot:
                image: murphy360/everythingbot:release-0.5
                container_name: discord_everythingbot
                dns:
                        - "8.8.8.8"
                        - "8.8.4.4"
                volumes:
                        - /docker/discord_bot_everything:/usr/src/bot/data
                restart: unless-stopped


## License

SitePoint's code archives and code examples are licensed under the MIT license.

Copyright © 2020 SitePoint

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
