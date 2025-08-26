import { EmbedBuilder } from "discord.js";

export function createAlertEmbed(symbol, alertType = "none", displayName) {
  const s = String(symbol ?? "");
  const alert = String(alertType ?? "none").toLowerCase();

  // colors: green = bullish, red = bearish, null = none
  const color =
    alert === "bullish" ? 0x00ff00 : alert === "bearish" ? 0xff0000 : null;

  const title = `${displayName} ${alertType}`;

  const when = new Date();
  const dateStr = when.toDateString(); // e.g., "Mon Sep 04 2023"

  const description = `An alert for **${s}**. Please check your trading platform`;

  // Simple fields: Name, Symbol, Date. All non-inline for clarity.
  const fields = [];
  const nameVal = displayName ?? "—";
  fields.push({
    name: "Name",
    value: String(nameVal).slice(0, 256) || "—",
    inline: false,
  });
  fields.push({ name: "Symbol", value: s || "—", inline: false });
  fields.push({ name: "Date", value: dateStr, inline: false });

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setImage(
      alert === "bullish"
        ? "https://imagedelivery.net/4-5JC1r3VHAXpnrwWHBHRQ/589fd70e-dfe5-498a-d9b4-a9363fdd7e00/w=430,h=242,fit=cover"
        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK85h4gXSZM00-8j9kuux3_FAyVxAOXlqVzw&s"
    )
    .setTimestamp(when)
    .setFooter({
      text: "Powered by Nomekuma",
      iconURL: "https://avatars.githubusercontent.com/u/122863540?v=4",
    });

  if (fields.length) embed.addFields(fields);

  return embed;
}
