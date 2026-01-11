const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// PRODUK PT
const products = [
  {
    id: "ptx8",
    name: "PT X8",
    price: "Rp 15.000",
    stock: 999,
  },
];

// BOT READY
client.once("ready", () => {
  console.log(`🤖 Bot PT aktif: ${client.user.tag}`);
});

// BUTTON ORDER
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const product = products.find((p) => p.id === interaction.customId);
  if (!product)
    return interaction.reply({ content: "❌ Produk tidak ditemukan", ephemeral: true });

  const channel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: process.env.OWNER_ID,
        allow: [PermissionsBitField.Flags.ViewChannel],
      },
    ],
  });

  const invoice = new EmbedBuilder()
    .setTitle("🧾 INVOICE PT X8")
    .setColor("Green")
    .addFields(
      { name: "👤 Pembeli", value: interaction.user.tag },
      { name: "📦 Produk", value: product.name },
      { name: "💰 Harga", value: product.price },
      { name: "💳 Pembayaran", value: "Dana / OVO / QRIS" }
    )
    .setFooter({ text: "Kirim bukti pembayaran di sini" });

  const doneBtn = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("selesai")
      .setLabel("✅ Selesai")
      .setStyle(ButtonStyle.Primary)
  );

  channel.send({ embeds: [invoice], components: [doneBtn] });

  interaction.reply({
    content: `✅ Ticket dibuat: ${channel}`,
    ephemeral: true,
  });

  // NOTIF ADMIN
  const owner = await client.users.fetch(process.env.OWNER_ID);
  owner.send(
    `🛒 ORDER BARU\nUser: ${interaction.user.tag}\nProduk: ${product.name}`
  );
});

// AUTO CLOSE
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "selesai") return;

  await interaction.reply("⏳ Ticket akan ditutup dalam 10 menit...");

  setTimeout(() => {
    interaction.channel.delete().catch(() => {});
  }, 600000); // 10 menit
});

// COMMAND
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!produk") {
    const embed = new EmbedBuilder()
      .setTitle("🛒 JUAL PT / PT X8")
      .setColor("Blue")
      .setDescription(
        "Klik tombol di bawah untuk order\n\n" +
        "📦 **PT X8**\n💰 Rp 15.000\n⚡ Fast Process"
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ptx8")
        .setLabel("🛒 Order PT X8")
        .setStyle(ButtonStyle.Success)
    );

    message.reply({ embeds: [embed], components: [row] });
  }

  if (message.content === "!caraorder") {
    message.reply(
      "📝 **Cara Order PT X8:**\n1️⃣ Ketik `!produk`\n2️⃣ Klik tombol order\n3️⃣ Ticket dibuat\n4️⃣ Bayar\n5️⃣ Klik **Selesai**"
    );
  }
});

client.login(process.env.TOKEN);
