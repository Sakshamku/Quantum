import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBKWFsppSLCL1uNBFnLlD7T4JckUUmGkNQ";
const genAI = new GoogleGenerativeAI(apiKey);

// Use faster model (gemini-1.5-flash) and enable streaming optimization
async function generate(prompt) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",  // Faster response model
        generationConfig: { maxOutputTokens: 2048 }  // Limit response length
    });

    const result = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    return result.stream;  // Return raw stream directly
}

export default generate;


