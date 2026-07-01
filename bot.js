import { Client, GatewayIntentBits, SlashCommandBuilder, Routes } from "discord.js";
import { REST } from "@discordjs/rest";
import axios from "axios";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION");
  console.error(err);
});

const TOKEN = process.env.TOKEN;

let targetChannel = null;
let targetRole = null;
let lastAlertTime = 0;

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
    const response = await axios.get("http://localhost:8080/counts", {
      timeout: 5000,
    });

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

    if (players <= 9) return;

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