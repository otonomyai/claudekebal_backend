import express from 'express';
import { streamResponse } from './functions/streamResponse.js';
import aiLearningPrompt from './aiLearningPrompt.js';

const app = express();
app.use(express.json());

app.post('/stream', async (req, res) => {
  const { conversation } = req.body;
  console.log('Received conversation:', conversation);

  let updatedConversation = [...conversation];

  // Check if it's the first API call or the conversation has only one message
  if (conversation.length === 1 && conversation[0].role === "user") {
    // Update the first message with the AI Learning Companion Prompt and the user's first question
    updatedConversation = [
      {
        role: "user",
        content: [
          {
            text: `${aiLearningPrompt}\n\nThis is my first question:\n\n${conversation[0].content[0].text}`,
          },
        ],
      },
    ];
  } else if (conversation.length > 1) {
    // Check for consecutive user messages and remove the duplicate if found
    if (
      conversation[0].role === "user" &&
      conversation[1].role === "user"
    ) {
      // Remove the original first user message as it is now part of the AI Learning Companion prompt
      updatedConversation.shift();
    }
  }

  res.setHeader('Content-Type', 'application/json');

  try {
    const responseStream = streamResponse(updatedConversation);

    let responseText = '';
    for await (const chunk of responseStream) {
      responseText += chunk; // Collect the response chunks
      console.log(responseText);
    }

    // Send the updated conversation back to the frontend along with the response text
    res.status(200).json({
      responseText,
      updatedConversation,
    });

  } catch (err) {
    console.error('Streaming error:', err);
    res.status(500).json({ error: 'Failed to process the streaming request.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
