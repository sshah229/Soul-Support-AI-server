const path = require("path");
require("dotenv").config();
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// const { PythonShell } = require("python-shell");
const genAI = new GoogleGenerativeAI("AIzaSyD02kJ3dqI2k0v9hLbEfH-l0igviqq-S04"); // 🔐 Replace with your real key

const data = [
  {
    role: "system",
    content:
      "You are a helpful mental health companion and a friend. Be warm, kind, and supportive. Keep your answers to max 300 characters",
  },
];

async function QueryGPT(prompt) {
  data.push({ role: "user", content: prompt });

  // Convert to Gemini format
  const geminiMessages = data.map((msg) => {
    return msg.role === "user"
      ? { role: "user", parts: [{ text: msg.content }] }
      : { role: "model", parts: [{ text: msg.content }] };
  });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user", // Gemini expects the whole conversation as a user message contextually
          parts: [
            { text: data.map((d) => `${d.role}: ${d.content}`).join("\n") },
          ],
        },
      ],
    });

    const answer = result.response.text();
    console.log("Hello: ", answer); // Optional
    return answer;
  } catch (err) {
    console.error("Error from Gemini:", err);
    return "Oops! Something went wrong with Gemini.";
  }
}

//     const response = await openai.createCompletion({
//       model: "text-davinci-003",
//       prompt: `
//               ${prompt}

//               The time complexity of this function is
//               ###
//             `,
//       max_tokens: 64,
//       temperature: 0,
//       top_p: 1.0,
//       frequency_penalty: 0.0,
//       presence_penalty: 0.0,
//       stop: ["\n"],
//     });

// }

module.exports = QueryGPT;
