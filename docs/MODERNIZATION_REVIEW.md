# Modernization review

Started 2026-10-12. Reviewed `develop` at `44007e7` (Nov 2024), which is 13 commits ahead of `main`.
The latest release is v0.5.11 (2024-04-08).

## Where things stand

- The bot is a cross-guild Discord trivia game, about 5,000 lines of CommonJS on discord.js 14.
- It is not deployed. It appears only in `dontpanic/docker-compose.bak`, not the live compose file.
- `trivia_service` is live on dontpanic. It already does what half of this bot does: it generates questions with several LLMs, fact-checks them with web search, rejects near-duplicates, and stores them. Its README names "a Discord trivia bot" as its intended consumer.
- `~/Software/trivia_bot` exists but is empty, apart from Claude settings that point at `trivia_service`. It looks like the planned successor.
- Nothing has been touched for 23 months. 38 issues are open. Three branches from May 2023 are 82 commits behind `main`.

## The decision this review needs

The question source, the OpenAI client and the fact-checker are the most broken part of the bot. They are about 800 lines, and `trivia_service` replaces all of them.
What remains is the Discord side: slash commands, the game loop, scoring, leaderboards, champion roles and scheduled events.

| Option | What it means | Cost |
|---|---|---|
| A. Modernize in place | Stay on Node. Bump to a current LTS, prune deps, fix the bugs below, swap `ChatGPTClient` for a `trivia_service` HTTP client. | Smallest diff. Leaves a JS project outside `murphy360/standards`, which has Python templates and CI. |
| B. Rewrite as `trivia_bot` (recommended) | New Python repo from `template-python`, using discord.py and `trivia_service`. Port the game rules, not the code. Migrate players, games and champions from the old SQLite. | More work up front. One stack with your other services, and standards CI (lint, ratchet, images, tests) from day one. |
| C. Archive | Archive the repo and keep `trivia_service` for other consumers. | No work. |

I recommend B. Most of the surviving JS has the concurrency bugs listed below. The parts worth keeping are the game design and the data, not the code.

## Correctness findings

These matter for option A. For option B they are the list of mistakes the new bot must not repeat.

### Game can lock up until restart

1. **`game_in_progress` is never reset on failure.** `commands/trivia/trivia.js:185-187` sets it, awaits `game.play()`, then clears it. If `play()` throws or hangs, every later `/trivia play` says a game is in progress. There is no `try/finally`.
2. **Promises that never settle.** `ChatGPTClient` (`getRandomTriviaCategories` :70, `getChatCompletion` :116, `introDescription` :321) and `QuestionManager` (`factCheckQuestion` :204, `getOpenAIQuestions` :235) wrap calls in `new Promise` and only `resolve`. On an API error they log and never settle. Any OpenAI outage hangs the game forever, which then trips finding 1.
3. **Guild list is filled after the game starts.** `Game.getTriviaGuilds` (`classes/trivia/game.js:41-53`) runs `forEach(async ...)`, which `await` does not wait for. The intro and first question can go to an empty or partial guild list. `events/ready.js:24` uses the same pattern.

### Crashes

4. **`gradeGame` dereferences a missing guild.** `game.js:230-241` logs when `answerGuild` is undefined, then reads `answerGuild.players` on the next line.
5. **Short question lists.** With the bot as host, `game.js:94` floors questions per category, so 10 rounds over 3 categories yields 9 questions. `askQuestionToGuilds(undefined)` then throws at round 10.
6. **OpenTDB rate limits.** `getTDBQuestions` (`questionManager.js:193-198`) assumes `results` has `numQuestions` entries. OpenTDB returns `response_code: 5` with no results when rate-limited, so `new Question(undefined)` throws.
7. **The dev guild is a hard dependency.** The `QuestionManager` constructor (`questionManager.js:43-44`) reads `DEV_GUILD_ID` and a channel named `trivia_bot`. Every `Game` builds one, so no guild can play if the bot leaves the dev server or the channel is renamed. `events/guildCreate.js:28` and `events/guildMemberAdd.js:15` have the same dependency.
8. **`/trivia` errors leave Discord hanging.** `events/interactionCreate.js:23` logs the error but never replies, so users see "The application did not respond".

### Logic errors

9. **Assignment instead of comparison.** `ChatGPTClient.js:212` and `:216` use `if (error = '...')`, so the first branch always runs.
10. **Unbounded retries that escalate cost.** `getJsonFromAi` (`ChatGPTClient.js:265`) retries a parse failure with `gpt-4` and no limit. `addQuestions` (`questionManager.js:304-308`) recurses with no limit while the model keeps returning duplicates.
11. **Ties.** `gradeGame` resolves "Game Ended in Tie" (`game.js:259`) and then keeps running. `play()` then skips the scoreboard for ties. Issue #9 tracks tiebreakers.
12. **`this` in an arrow function.** `Users.prototype.addGame` (`dbObjects.js:23-36`) uses an arrow function, so `this.user_id` is undefined.
13. **Missing `await`.** `Question.syncQuestion` (`question.js:91`) compares a Promise's `.question`.
14. **Dead, broken code.** `ChatGPTClient.getImageUrl` (:45-53) calls an API that does not exist in openai v3 and assigns undeclared globals.
15. **Mixed time zones.** The 06:00 cron runs in `Pacific/Auckland` (`ready.js:43`), but "tonight at 19:00" uses container time (`ready.js:78-84`), which is UTC in Docker. That is 15:00 Eastern.
16. **Dead `.env` paths.** Most modules call `dotenv.config` with cwd-relative paths like `./../data/.env` that do not exist. They only work because `index.js` loaded `./data/.env` first.

### Discord platform

17. **Commands are redeployed on every start.** `ready.js:19` PUTs global commands, and `ready.js:25` clears guild commands in every guild. This burns rate limit, and global command updates can take time to appear.
18. **An unused privileged intent.** `GuildPresences` is requested in `index.js:13`, but `events/presenceUpdate.js` is empty. Privileged intents need Discord approval once a bot passes 100 guilds. Drop it.
19. **Open paid endpoint.** `events/messageCreate.js` sends every message in the `CHAT_GPT_CHANNEL` channel to OpenAI, with no rate limit or allowlist. `CHAT_GPT_CHANNEL` is missing from `data/template.env`. Every past message goes in as `role: user`, including the bot's own replies.
20. **One game for the whole world.** `game_in_progress` is a module global. That is the "world trivia" design, so keep it deliberately, and make it per-process state that survives errors.

## Dependencies and build

- **Node 21.6.1** (`Dockerfile`) is an odd-numbered release and reached end of life in June 2024. Move to a current LTS line.
- **`npm audit`** on the lockfile reports 45 vulnerabilities: 9 critical, 27 high, 8 moderate and 1 low. The critical ones include `sequelize`, `tar`, `request`, `form-data` and `yt-search`.
- **12 of 20 runtime dependencies are never required:** `xmlhttprequest`, `tough-cookie`, `avconv`, `ffmpeg`, `greetings` (the npm package; the local `greetings.js` is used), `opusscript`, `pokedex-promise-v2`, `uws`, `yt-search`, `ytdl`, `ytdl-core` and `node-jq`. Removing them clears much of the audit.
- **Pinned versions are behind:** discord.js 14.9.0 (14.27.0 is current), openai 3.2.1 (7.x is current, with a different API), sqlite3 5.0.2 (6.x), cron 2.x (4.x) and node-fetch 2 (Node has `fetch` built in).
- **Retired models:** `gpt-3.5-turbo` and `gpt-4` are hard-coded in `ready.js`, `ChatGPTClient.js` and `questionManager.js`.
- **The Dockerfile ignores the lockfile.** It copies only `package.json` before `npm install`, so builds are not reproducible. It also runs `apt upgrade`, installs `git`, `vim` and `jq` into the runtime image, and has no healthcheck. Use `npm ci` with the lockfile, a multi-stage build, and a slim runtime.
- **No migrations.** The schema comes from `sequelize.sync({ alter: true })` in `dbInit.js`. On SQLite, `alter` rebuilds tables, and nothing in the image runs `dbInit.js`.
- **No CI, tests or lint.** Images were published to Docker Hub as `murphy360/everythingbot`. Your other services publish to ghcr through `murphy360/standards` reusable workflows.

## Housekeeping

- `backup/` holds 9 dead files, including old music and joke commands and `stats.save`.
- The category table is duplicated in `commands/trivia/trivia.js` and `classes/trivia/questionManager.js`.
- The README license section is SitePoint's MIT text from the 2020 fork, but `package.json` says ISC. Pick one.
- The README's `docker run` path points at an old WSL home directory.
- `main` and `develop` have diverged. `develop` carries the #149 fix (PRs #150 to #152) that never reached `main` or a release.
- These branches are stale: `60-send-a-pun-a-day-1`, `74-allow-admin-to-lock-what-categories-in-trivia` and `80-openai-intro-on-startup`, all from May 2023. Branch `149-...` is already merged into `develop`.

## Open issues after the move to `trivia_service`

- **Moot:** `trivia_service` owns question sourcing and quality. That covers #95, #102, #103, #106, #119, #126, #127 and #128.
- **Still about the bot:** #9 tiebreakers, #11 player stats, #50 per-guild scoring, #57 champion date, #68 guild champion logic, #70 and #74 admin category limits, #75 mobile scoreboard, #85 deleted messages, #86 button shading, #110 embed after ownership and #114 listener cleanup.
- **Crash bugs to fold into the work:** #146 (default channel undefined) and #149 (missing permissions in `intro.js`). Findings 7 and 8 above are related.
- **Feature ideas that need your call:** #59 game pictures, #60 pun a day, #66 changelog on startup, #69 bot log channel, #72 verified by, #73 noob onboarding, #80 AI intro, #107 changelog embed, #108 category cleanup and #130 achievements.

## Data worth keeping

The SQLite file at `/docker/discord_bot_everything/database.sqlite` on dontpanic holds `users`, `games`, `games_played`, `guilds`, `answers` and `questions`. Players, games, guild points and champion history are the community's record and should migrate. Questions can be loaded into `trivia_service` as seed data, or dropped. I have not checked that the file still exists.

## Next steps

1. Owner: choose A, B or C.
2. If B: create `murphy360/trivia_bot` from `template-python`, write a milestone with a RUN ORDER, and file tickets. Suggested order:
   1. Skeleton: bot login, `/trivia play` against `trivia_service`, one guild.
   2. The game loop with timeouts and `try/finally` state.
   3. Cross-guild play and scoring.
   4. Leaderboards and champion roles.
   5. Migrate the old SQLite data.
   6. Scheduled Trivia Night.
   7. Deploy through dontpanic.
   8. Archive this repo.
3. If A: fix the lock-up and crash findings first (1 to 8), then deps and Docker, then swap the question source.
