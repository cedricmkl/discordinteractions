import {
  APIInteraction,
  APIInteractionResponse,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseDeferredChannelMessageWithSource,
  APIInteractionResponseDeferredMessageUpdate,
  APIInteractionResponseUpdateMessage,
  APIModalInteractionResponse,
} from "https://deno.land/x/discord_api_types/v10.ts";

export type InteractionClientOptions = {
  publicKey: string;
  debug?: boolean;
};

export type BaseInteractionResponse =
  | APIInteractionResponseChannelMessageWithSource
  | APIInteractionResponseDeferredChannelMessageWithSource;

export type ApplicationCommandInteractionResponse =
  | BaseInteractionResponse
  | APIModalInteractionResponse;

export type MessageComponentInteractionResponse =
  | BaseInteractionResponse
  | APIInteractionResponseUpdateMessage
  | APIInteractionResponseDeferredMessageUpdate
  | APIModalInteractionResponse;

export type InteractionHandler<T, R> = (interaction: T) => R | Promise<R>;
export type ErrorHandler = (
  interaction: APIInteraction,
  error: Error,
) => APIInteractionResponse | Promise<APIInteractionResponse> | null;
export type HandlerKey =
  | "ping"
  | "slash"
  | "context"
  | "autocomplete"
  | "button"
  | "select"
  | "modal"
  | "error";
export type HandlerFn =
  | InteractionHandler<APIInteraction, APIInteractionResponse>
  | ErrorHandler;
