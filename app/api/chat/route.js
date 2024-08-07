import { NextResponse } from "next/server";
import { fetch } from "node-fetch";

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = ""// Use your own system prompt here

// POST function to handle incoming requests
export async function POST(req) {
    const data = await req.json() // Parse the JSON body of the incoming request

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "meta-llama/llama-3.1-8b-instruct:free",
            messages: [{ "role": 'system', content: systemPrompt }, ...messages],
            stream: true
        })
    });

    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
            try {
                // Iterate over the streamed chunks of the response
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
                    if (content) {
                        const text = encoder.encode(content) // Encode the content to Uint8Array
                        controller.enqueue(text) // Enqueue the encoded text to the stream
                    }
                }
            } catch (err) {
                controller.error(err) // Handle any errors that occur during streaming
            } finally {
                controller.close() // Close the stream when done
            }
        },
    })

    return new NextResponse(stream) // Return the stream as the response
}

