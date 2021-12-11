const { Client, Intents, Permissions, MessageButton, MessageEmbed, MessageActionRow } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES], partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"], restTimeOffset: 50 });
const { default:axios } = require("axios");
const { randomBytes } = require("crypto");

client.on("ready", () => console.log(`Logged in as ${client.user.tag}.`));

client.on("messageCreate", (message) => {
  if (message.content === "!scratchauth" && message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
    const embed = new MessageEmbed()
      .setTitle("Scratch認証")
      .setDescription("下のボタンを押して、ScratchのアカウントとDiscordアカウントの紐付けを開始してください。")
      .setColor("GREEN");
    const button = new MessageButton()
      .setCustomId("verify")
      .setStyle("SUCCESS")
      .setLabel("認証");
    message.channel.send({ embeds: [embed], components: [new MessageActionRow().addComponents(button)] });
  }
})