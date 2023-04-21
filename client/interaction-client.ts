import { verifyKey } from "../util/verify.ts";
import {
  badRequest,
  internalServerError,
  ok,
} from "https://ghuc.cc/worker-tools/response-creators";
import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandInteraction,
  APIChatInputApplicationCommandInteraction,
  APIChatInputApplicationCommandInteractionData,
  APIContextMenuInteraction,
  APIInteractionResponsePong,
  APIMessageComponentButtonInteraction,
  APIMessageComponentInteraction,
  APIMessageComponentInteractionData,
  APIMessageComponentSelectMenuInteraction,
  APIModalSubmission,
  APIModalSubmitInteraction,
  APIPingInteraction,
  ApplicationCommandType,
  ComponentType,
  InteractionResponseType,
  InteractionType,
} from "https://deno.land/x/discord_api_types@0.37.39/v10.ts";
import {
  APIApplicationCommandInteractionData,
  APIInteraction,
} from "https://deno.land/x/discord_api_types/v10.ts";
import { Handler } from "../util/handler.ts";
import {
  ApplicationCommandInteractionResponse,
  BaseInteractionResponse,
  ErrorHandler,
  HandlerFn,
  HandlerKey,
  InteractionClientOptions,
  InteractionHandler,
  MessageComponentInteractionResponse,
} from "./types.ts";

function toHandlerInput(
  interaction: APIInteraction,
): [HandlerKey, string | null] {
  switch (interaction.type) {
    case InteractionType.Ping:
      return ["ping", null];
    case InteractionType.ApplicationCommand: {
      const data =
        (interaction.data as unknown) as APIApplicationCommandInteractionData;
      if (data.type === ApplicationCommandType.ChatInput) {
        return ["slash", data.name];
      }
      return ["context", data.name];
    }
    case InteractionType.ApplicationCommandAutocomplete: {
      const data = (interaction
        .data as unknown) as APIChatInputApplicationCommandInteractionData;
      return ["autocomplete", data.name];
    }
    case InteractionType.MessageComponent: {
      const data =
        (interaction.data as unknown) as APIMessageComponentInteractionData;
      if (data.component_type === ComponentType.Button) {
        return ["button", data.custom_id];
      }
      return ["select", data.custom_id];
    }
    case InteractionType.ModalSubmit: {
      const data = (interaction.data as unknown) as APIModalSubmission;
      return ["modal", data.custom_id];
    }
  }
}

export function interactions(
  options: InteractionClientOptions,
): InteractionClient {
  return new InteractionClient(options);
}

export class InteractionClient {
  handler = new Handler<HandlerKey, HandlerFn>();
  constructor(readonly options: InteractionClientOptions) {
    this.ping((_) => {
      return { type: InteractionResponseType.Pong };
    });
  }

  handle = async (request: Request): Promise<Response> => {
    const body = await request.text();
    if (!await verifyKey(request, body, this.options.publicKey)) {
      return badRequest();
    }

    const interaction = await JSON.parse(body) as APIInteraction;
    const [key, match] = toHandlerInput(interaction);
    const handler = this.handler.findHandler(key, match);

    if (!handler) {
      console.error("Failed to handle interaction", interaction);
      return internalServerError();
    }

    if (this.options.debug) console.log("Handling interaction", interaction);

    try {
      //@ts-ignore
      const response = await handler.handle(interaction);
      return ok(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return this.handleError(interaction, error, handler.index);
    }
  };

  private async handleError(
    interaction: APIInteraction,
    error: Error,
    index: number,
  ): Promise<Response> {
    const handler = this.handler.findHandler("error", null, index);
    if (handler) {
      const response = await handler.handle(interaction, error);
      if (response) {
        return ok(JSON.stringify(response), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    }
    console.error(error);
    return internalServerError();
  }

  private ping(
    handler: InteractionHandler<APIPingInteraction, APIInteractionResponsePong>,
  ): this {
    //@ts-ignore
    this.handler.add(["ping"], "*", handler);
    return this;
  }

  command(
    match: string,
    handler: InteractionHandler<
      APIApplicationCommandInteraction,
      ApplicationCommandInteractionResponse
    >,
  ): this {
    //@ts-ignore
    this.handler.add(["slash", "context"], match, handler);
    return this;
  }

  slash(
    match: string,
    handler: InteractionHandler<
      APIChatInputApplicationCommandInteraction,
      ApplicationCommandInteractionResponse
    >,
  ): this {
    //@ts-ignore
    this.handler.add(["slash"], match, handler);
    return this;
  }

  context(
    match: string,
    handler: InteractionHandler<
      APIContextMenuInteraction,
      ApplicationCommandInteractionResponse
    >,
  ): this {
    //@ts-ignore
    this.handler.add(["context"], match, handler);
    return this;
  }

  autocomplete(
    match: string,
    handler: InteractionHandler<
      APIApplicationCommandAutocompleteInteraction,
      APIApplicationCommandAutocompleteResponse
    >,
  ): this {
    //@ts-ignore
    this.handler.add(["autocomplete"], match, handler);
    return this;
  }

  component(
    match: string,
    handler: InteractionHandler<
      APIMessageComponentInteraction,
      MessageComponentInteractionResponse
    >,
  ): this {
    //@ts-ignore
    this.handler.add(["button", "select"], match, handler);
    return this;
  }

  button(
    match: string,
    handler: InteractionHandler<
      APIMessageComponentButtonInteraction,
      MessageComponentInteractionResponse
    >,
  ): this {
    //@ts-ignore
    this.handler.add(["button"], match, handler);
    return this;
  }

  select(
    match: string,
    handler: InteractionHandler<
      APIMessageComponentSelectMenuInteraction,
      MessageComponentInteractionResponse
    >,
  ): this {
    //@ts-ignore
    this.handler.add(["select"], match, handler);
    return this;
  }

  modal(
    match: string,
    handler: InteractionHandler<
      APIModalSubmitInteraction,
      BaseInteractionResponse
    >,
  ): this {
    //@ts-ignore
    this.handler.add(["modal"], match, handler);
    return this;
  }

  error(handler: ErrorHandler): this {
    //@ts-ignore
    this.handler.add(["error"], null, handler);
    return this;
  }
}
