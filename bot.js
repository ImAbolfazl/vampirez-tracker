import { Client, GatewayIntentBits, SlashCommandBuilder, Routes } from "discord.js";
import { REST } from "@discordjs/rest";
import axios from "axios";
import express from "express";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION");
  console.error(err);
});

const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT || 8055;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

let targetChannel = null;
let targetRole = null;
let lastAlertTime = 0;

const app = express();
let currentPlayers = "";

app.use(cors({
    origin:"*",
    methods:"*"
}));
app.use(express.json());

async function fetchData() {
    try{
        const response = await axios({
            method: "get",
            url: "https://api.hypixel.net/v2/counts",
            headers: {
                "API-Key": process.env.HYPIXEL_API_KEY
            }
        });

        if(response){
            return response.data;
        }
    }catch(err){console.log(err);}
}

setInterval(async () => {
    currentPlayers = await fetchData();
}, 5000);

app.get("/counts", (req, res) => {
  if(req.header.password != process.env.PASSWORD){return res.sendStatus(401)}
  res.json(currentPlayers);
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const rest = new REST({ version: "10" }).setToken(TOKEN);

const commands = [
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Set the channel and role for VampireZ alerts")
    .addChannelOption((o) =>
      o.setName("channel").setDescription("Channel").setRequired(true)
    )
    .addRoleOption((o) =>
      o.setName("role").setDescription("Role").setRequired(true)
    )
    .toJSON(),
];

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log("Commands registered.");
  } catch (err) {
    console.error(err);
  }

  setInterval(checkPlayerCount, 5000);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "setup") {
    targetChannel = interaction.options.getChannel("channel");
    targetRole = interaction.options.getRole("role");

    await interaction.reply(
      `Setup complete!\nChannel: ${targetChannel}\nRole: ${targetRole}`
    );
  }
});

async function fetchVampirezCount() {
  try {
    const response = await axios.get(
      `${API_URL}/counts`, 
      {
        timeout: 5000,
        headers: {
          password: process.env.PASSWORD
        }
      }
    );

    return response.data.games.LEGACY.modes.VAMPIREZ;
  } catch (err) {
    console.error("Fetch failed:", err.message);
    return 0;
  }
}

async function checkPlayerCount() {
  if (!targetChannel || !targetRole) return;

  try {
    const players = await fetchVampirezCount();

    if (players <= 8) return;

    const now = Date.now();

    if (now - lastAlertTime < 300000) return;

    await targetChannel.send(
      `${targetRole} 🚨 **VampireZ** currently has **${players}** players! Queue up!`
    );

    lastAlertTime = now;
  } catch (err) {
    console.error("checkPlayerCount:", err);
  }
}

(async () => {
  try {
    console.log("Logging into Discord...");
    await client.login(TOKEN);
    console.log("Login successful.");
  } catch (err) {
    console.error("Login failed:");
    console.error(err);
  }
})();