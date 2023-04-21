import { APIInteractionResponseDeferredChannelMessageWithSource } from "https://deno.land/x/discord_api_types/v10.ts";
import {
  APIActionRowComponent,
  APIButtonComponent,
  APIInteractionResponseChannelMessageWithSource,
  APIMessageActionRowComponent,
  APIMessageComponentEmoji,
  APIModalInteractionResponse,
  APITextInputComponent,
  ButtonStyle,
  ComponentType,
  InteractionResponseType,
  RESTPostAPIWebhookWithTokenJSONBody,
  TextInputStyle,
} from "https://deno.land/x/discord_api_types@0.37.39/v10.ts";

export function message(
  data: RESTPostAPIWebhookWithTokenJSONBody,
): APIInteractionResponseChannelMessageWithSource {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data,
  };
}

export function defer(): APIInteractionResponseDeferredChannelMessageWithSource {
  return {
    type: InteractionResponseType.DeferredChannelMessageWithSource,
  };
}

export type ModalProps = {
  title: string;
  custom_id: string;
  components: APITextInputComponent[];
};

export function modal(props: ModalProps): APIModalInteractionResponse {
  return {
    type: InteractionResponseType.Modal,
    data: {
      title: props.title,
      custom_id: props.custom_id,
      components: [modalRow(props.components)],
    },
  };
}

function modalRow(
  components: APITextInputComponent[],
): APIActionRowComponent<APITextInputComponent> {
  return {
    type: ComponentType.ActionRow,
    components,
  };
}

type TextInputProps = {
  style: TextInputStyle;
  custom_id: string;
  label: string;
  placeholder?: string;
  value?: string;
  min_length?: number;
  max_length?: number;
  required?: boolean;
};

export function textInput(props: TextInputProps): APITextInputComponent {
  return {
    type: ComponentType.TextInput,
    ...props,
  };
}

export function row(
  components: APIMessageActionRowComponent[],
): APIActionRowComponent<APIMessageActionRowComponent> {
  return {
    type: ComponentType.ActionRow,
    components,
  };
}

type ButtonProps = {
  label: string;
  emoji?: APIMessageComponentEmoji;
  disabled?: boolean;
};

type ButtonPropsCustomId = ButtonProps & {
  style:
  | ButtonStyle.Primary
  | ButtonStyle.Secondary
  | ButtonStyle.Success
  | ButtonStyle.Danger;
  custom_id: string;
};

type ButtonPropsUrl = ButtonProps & {
  style: ButtonStyle.Link;
  url: string;
};

export function button(
  props: ButtonPropsCustomId | ButtonPropsUrl,
): APIButtonComponent {
  return {
    type: ComponentType.Button,
    ...props,
  };
}
