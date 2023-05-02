import { parse } from "https://deno.land/std@0.182.0/flags/mod.ts";

const flags = parse(Deno.args, {
  string: ["token", "applicationId", "file", "guildId"],
});

if (!flags.token || !flags.applicationId || !flags.file) {
  console.log("Missing arguments");
  Deno.exit(1);
}

const commands = await Deno.readTextFile(flags.file);
let url = `https://discord.com/api/v10/applications/${flags.applicationId}`;
if (flags.guildId) url += `/guilds/${flags.guildId}/commands`;
else url += "/commands";

const result = await fetch(url, {
  method: "PUT",
  body: commands,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bot ${flags.token}`,
  },
});

if (!result.ok) {
  console.log(
    "Error while registering commands. Status:",
    result.status,
    "Body:",
    await result.text(),
  );
  Deno.exit(1);
}
