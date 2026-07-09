# VampireZ Tracker

A Discord bot that checks the player count for **VampireZ** on Hypixel and pings a role when it has enough players to queue. Built with **Discord.js**, **Express**, and the **Hypixel API**.

## Features

* `/setup` command to pick the alert channel and role
* Checks VampireZ player count every 5 seconds
* Sends an alert when the player count is enough
* Cooldown so it doesn't spam alerts

## Libraries used

* discord.js
* axios
* express
* cors
* dotenv

## Getting started with the project!

### Clone the Repository

```bash
git clone https://github.com/ImAbolfazl/vampirez-tracker
cd vampirez-tracker
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root:

```env
TOKEN=your-discord-bot-token
HYPIXEL_API_KEY=your-hypixel-api-key
PASSWORD=a-shared-secret-for-the-counts-endpoint
PORT=8055
API_URL=http://localhost:8055
```

* `TOKEN` — your Discord bot token
* `HYPIXEL_API_KEY` — your Hypixel API key
* `PASSWORD` — secret used to protect the `/counts` endpoint
* `PORT` — port the server runs on (defaults to `8055`)
* `API_URL` — url the bot uses to reach its own `/counts` endpoint

### Run the bot

```bash
node bot.js
```

The bot will log in to Discord, register its slash command, and start polling Hypixel for player counts. The Express server will run on:

```text
http://localhost:8055
```

## Discord Commands

### `/setup`

Sets the channel and role used for VampireZ alerts.

| Option    | Type    | Required | Description                          |
|-----------|---------|----------|--------------------------------------|
| `channel` | Channel | Yes      | Channel where alerts get posted      |
| `role`    | Role    | Yes      | Role to ping                         |

## API Endpoints

### Get player counts

```http
GET /counts
```

Needs a `password` header matching your `PASSWORD` env variable.

Headers:
```json
{
  "password": "your-shared-secret"
}
```

## Notes
 
The `/counts` endpoint is also used by other projects, not just this bot — that's why it's exposed as an API instead of just being an internal variable.

The bot only supports one server at a time. If you run `/setup` in another server, it will replace the previous one.

## Author

Built by Abolfazl & iRxngo!
