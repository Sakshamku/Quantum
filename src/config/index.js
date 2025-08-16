import generate from "./gemini.js";

async function runChat(prompt, { signal } = {}) {
    const stream = await generate(prompt);
    let response = "";

    for await (const chunk of stream) {
        const chunkText = chunk.text();
        if (chunkText) {
            response += chunkText;
        }
    }

    return response;
}

export default runChat; 
