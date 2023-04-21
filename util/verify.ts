import nacl from "https://esm.sh/tweetnacl@1.0.3/";
import { hexToBuffer } from "https://deno.land/x/hextools/mod.ts";

//Some stuff from https://github.com/discord/discord-interactions-js/blob/main/src/index.ts

function concatUint8Arrays(arr1: Uint8Array, arr2: Uint8Array): Uint8Array {
  const merged = new Uint8Array(arr1.length + arr2.length);
  merged.set(arr1);
  merged.set(arr2, arr1.length);
  return merged;
}

export async function verifyKey(
  request: Request,
  body: string,
  publicKey: string,
): Promise<boolean> {
  if (
    !request.headers.has("X-Signature-Ed25519") ||
    !request.headers.has("X-Signature-Timestamp")
  ) return false;
  const encoder = new TextEncoder();
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  const signature = request.headers.get("X-Signature-Ed25519")!;

  return nacl.sign.detached
    .verify(
      concatUint8Arrays(encoder.encode(timestamp), encoder.encode(body)),
      new Uint8Array(hexToBuffer(signature)),
      new Uint8Array(hexToBuffer(publicKey)),
    );
}
