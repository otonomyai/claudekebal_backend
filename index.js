import {
    BedrockRuntimeClient,
    ConverseStreamCommand,
  } from '@aws-sdk/client-bedrock-runtime';
  import dotenv from 'dotenv';
  
  // Load environment variables from .env file
  dotenv.config();
  
  // Create a Bedrock Runtime client in the AWS Region you want to use.
  const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
  
  // Set the model ID, e.g., Claude 3.5 Sonnet.
  const modelId = 'anthropic.claude-3-5-sonnet-20240620-v1:0';
  
  // Start a conversation with the user message.
  const userMessage = 'make a vulkan game engine with a triangle';
  const conversation = [
    {
      role: 'user',
      content: [{ text: userMessage }],
    },
  ];
  
  // Create a command with the model ID, the message, and a basic configuration.
  const command = new ConverseStreamCommand({
    modelId,
    messages: conversation,
    inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9 },
  });
  
  (async () => {
    try {
      // Send the command to the model and stream the response in real-time
      const response = await client.send(command);
  
      // Extract and print the streamed response text in real-time.
      for await (const item of response.stream) {
        if (item.contentBlockDelta) {
          process.stdout.write(item.contentBlockDelta.delta?.text || '');
        }
      }
    } catch (err) {
      console.log(`ERROR: Can't invoke '${modelId}'. Reason: ${err}`);
      process.exit(1);
    }
  })();