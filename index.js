const { Client, Intents, Permissions, MessageButton, MessageEmbed, MessageActionRow, MessageCollector, Message } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES], partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"], restTimeOffset: 50 });
const { default: axios } = require("axios");
const { randomBytes } = require("crypto");
const config = require("./config.json");

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
});

client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;
  if (i.customId === "verify") {
    await i.deferReply();
    i.author.send("あなたのScratchユーザー名を送信してください。")
      .then(async (msg) => {
        /**
         * 
         * @type {MessageCollector}
         */
        const collector = msg.channel.createMessageCollector({ filter: (m) => m.author.id === i.user.id });
        let scratchName = "";
        let uuid = "";
        collector.on("collect", async (m) => {
          const am = await m.channel.send("ユーザー名を確認中です。");
          axios({
            url: `https://api.scratch.mit.edu/users/${encodeURIComponent(m.cleanContent)}`,
            responseType: "json",
            method: "get"
          })
            .then(() => {
              scratchName = m.cleanContent;
              const but = new MessageButton()
                .setCustomId("auth")
                .setStyle("SUCCESS")
                .setLabel("「私について」に貼りました")
                .setDisabled(true);
              uuid = `${randomBytes(4).toString("hex")}-${randomBytes(2).toString("hex")}-${randomBytes(2).toString("hex")}-${randomBytes(2).toString("hex")}-${randomBytes(6).toString("hex")}`;
              am.edit({ content: "ユーザー名の確認ができました。\n次に、下のコード\n(`XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`形式)\nを、あなたのScratchプロフィールの、**私について**のどこかに貼り付けてください。\n貼り付けてから1分くらい経過したら、下のボタンが押せるようになっているので、押してください。", embeds: [{
                description: `\`\`\`\n${uuid}\n\`\`\``
              }], components: [new MessageActionRow().addComponents(but)] });
              setTimeout(() => am.edit({ components: [new MessageActionRow().addComponents(am.components[0].components[0].setDisabled(false))]}), 1000 * 60);
              
              collector.stop();
              return handleButton(am);
            })
            .catch(() => {
              return am.edit("Scratchユーザーが存在しません。");
            })
        })

        /**
         * 
         * @param {Message} message
         */
        async function handleButton(message) {
          const collector = message.createMessageComponentCollector();
          collector.on("collect", async (mci) => {
            await mci.deferReply();
            const { data } = await axios({
              url: `https://api.scratch.mit.edu/users/${encodeURIComponent(scratchName)}`,
              responseType: "json",
              method: "get"
            });
            if (data.bio.includes(uuid)) {
              mci.followUp("認証が完了しました！");
              for (const role of config.verifiedRoles) {
                i.member.roles.add(role);
              }
            } else {
              mci.followUp("まだキャッシュに反映されていないか、設定されていないようです...30秒後にもう一度お試しください。");
            }
          })
        }
      })
      .catch(e => {
        if (e.toString().includes("to this user")) return i.followUp("DMの送信ができません。DM設定を変更してください。");
      })
  }
});

client.login(process.env.BOT_TOKEN);