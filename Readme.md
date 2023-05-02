# Discord Interactions

Deno library to handle Discord Interactions via http.

## Example

```ts
import {
  interactions,
  message,
} from "https://deno.land/x/discordinteractions/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";

const client = interactions({
  publicKey: "<YOUR_PUBLIC_KEY>",
})
  .slash(
    "test",
    (i) => message({ content: `Hello ${i.member?.user.username}!` }),
  );

serve(client.handle);
```

## Registering Commands

You can register your Commands using this command:

`deno run https://deno.land/x/discordinteractions/scripts/registerCommands.ts --token <BOT_TOKEN> --applicationId <APP_ID> --guildId <OPTIONAL_GUILD_ID> --file <COMMANDS_FILE>`

Commands file:

```json
[{
  "name": "test",
  "description": "This is a Test command!"
}]
```
