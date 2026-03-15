import { OpenRouter } from "@openrouter/sdk";

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || "";

if (!apiKey) {
    console.error("VITE_OPENROUTER_API_KEY is missing. Create a .env file at project root with this variable and restart Vite.");
    // Optional: disable API calls safely rather than failing silently
}

console.log("API Key:", apiKey ? "Loaded" : "Not loaded");

const openRouter = new OpenRouter({
    apiKey,
    defaultHeaders: {
        "HTTP-Referer": window.location.origin,
        "X-OpenRouter-Title": "My AI App",
    },
});

async function generate(prompt) {
    try {
        const completion = await openRouter.chat.send({
            chatGenerationParams: {
                model: "meta-llama/llama-3-8b-instruct",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                maxTokens: 512,
                temperature: 0.7,
                stream: false,
            },
        });

        if (completion?.choices?.length > 0) {
            return completion.choices[0].message?.content || "";
        }

        return "";
    } catch (error) {
        console.error("API call failed:", error);
        return "Error generating response";
    }
}

export default generate;