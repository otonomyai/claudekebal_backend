import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";

dotenv.config();

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

export async function* streamResponse(conversation) {
  // Remove timestamp field from each message in the conversation and ensure content is in the correct format
  const cleanedConversation = conversation.map(({ timestamp, ...rest }) => {
    // If content is a string, wrap it in an array of objects with a text property
    if (typeof rest.content === 'string') {
      rest.content = [{ text: rest.content }];
    }
    return rest;
  });

  console.log(cleanedConversation, "Cleaned conversation");

  const modelId = "anthropic.claude-3-5-sonnet-20240620-v1:0";

  const command = new ConverseStreamCommand({
    modelId,
    messages: cleanedConversation, // Use the modified array
    inferenceConfig: { maxTokens: 4090, temperature: 0.5, topP: 0.9 },
  });

  try {
    const response = await client.send(command);

    for await (const item of response.stream) {
      if (item.contentBlockDelta) {
        const text = item.contentBlockDelta.delta?.text || "";
        yield text; // Yield each chunk of text as it arrives
      }
    }
  } catch (err) {
    console.error(`ERROR: Can't invoke '${modelId}'. Reason: ${err}`);
    throw err;
  }
}
