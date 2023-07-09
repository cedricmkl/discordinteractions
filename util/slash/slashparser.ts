import {
    APIAttachment,
    APIChannel,
    APIChatInputApplicationCommandInteraction,
    APIChatInputApplicationCommandInteractionData,
    APIGuildMember,
    APIRole,
    APIUser,
    ApplicationCommandOptionType,
} from "https://deno.land/x/discord_api_types@0.37.39/v10.ts";
import { ApplicationCommandInteractionResponse } from "../../client/types.ts";
import { Handler } from "../handler.ts";
import { message } from "../helpers.ts";

type Options = {
    [key: string]: OptionType;
};

type Key = "base" | "subcommand" | "subcommandgroup";
type OptionType =
    | string
    | number
    | boolean
    | APIUser
    | APIGuildMember
    | APIChannel
    | APIRole
    | APIAttachment;
type HandleFunction = (
    interaction: APIChatInputApplicationCommandInteraction,
    options: Options,
) => ApplicationCommandInteractionResponse;

export function slashParser(): SlashParser {
    return new SlashParser();
}

function transformOptions(
    data: APIChatInputApplicationCommandInteractionData,
): Options {
    const options: Options = {};
    const resolved = data.resolved ?? {};
    for (const option of data.options ?? []) {
        switch (option.type) {
            case ApplicationCommandOptionType.Subcommand:
            case ApplicationCommandOptionType.SubcommandGroup:
                continue;
            case ApplicationCommandOptionType.String:
                options[option.name] = option.value as string;
                break;
            case ApplicationCommandOptionType.Integer:
            case ApplicationCommandOptionType.Number:
                options[option.name] = option.value as number;
                break;
            case ApplicationCommandOptionType.Boolean:
                options[option.name] = option.value as boolean;
                break;
            case ApplicationCommandOptionType.User:
                options[option.name] = resolved.users?.[option.value] as APIUser;
                break;
            case ApplicationCommandOptionType.Channel:
                options[option.name] = resolved.channels?.[option.value] as APIChannel;
                break;
            case ApplicationCommandOptionType.Role:
                options[option.name] = resolved.roles?.[option.value] as APIRole;
                break;
            case ApplicationCommandOptionType.Mentionable:
                //TODO
                break;
        }
    }
    return options;
}

class SlashParser {
    private handler = new Handler<Key, HandleFunction>();

    constructor() { }

    base(handle: HandleFunction): this {
        this.handler.add(["base"], null, handle);
        return this;
    }

    subcommand(name: string, handle: HandleFunction): this {
        this.handler.add(["subcommand"], name, handle);
        return this;
    }

    subcommandGroup(
        name: string,
        subcommand: string,
        handle: HandleFunction,
    ): this {
        this.handler.add(["subcommandgroup"], name, handle);
        return this;
    }

    handle = (interaction: APIChatInputApplicationCommandInteraction): ApplicationCommandInteractionResponse => {
        const { options } = interaction.data;
        const transformedOptions = transformOptions(interaction.data);

        const subCommandGroup = options?.find((o) => o.type === ApplicationCommandOptionType.SubcommandGroup)?.name;
        const subCommand = options?.find((o) => o.type === ApplicationCommandOptionType.Subcommand)?.name;

        if (!subCommand && !subCommandGroup) {
            const handler = this.handler.findHandler("base", null);
            if (handler) return handler.handle(interaction, transformedOptions);
        }

        return message({ content: "Not implemented" });
    };
}
