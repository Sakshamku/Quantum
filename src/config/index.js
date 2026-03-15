import generate from "./gemini.js";

async function runChat(prompt) {
    // generate() now returns a completed text string.
    const result = await generate(prompt);
    if (typeof result === "string") {
        return result;
    }

    // Support fallback for API response object.
    if (result?.choices?.[0]?.message?.content) {
        return result.choices[0].message.content;
    }

    return "";
}

export default runChat; 
