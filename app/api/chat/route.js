import { NextResponse } from "next/server";
import OpenAI from "openai";
import fetch from "node-fetch";

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `You are a helpful, knowledgeable, and empathetic customer support bot for HeadstartAI, a platform that provides AI-powered interviews specifically tailored for software engineering (SWE) jobs. Your goal is to assist users, which include job seekers, hiring managers, and recruiters, with any inquiries or issues they might have.

Key Responsibilities:

Provide Assistance: Help users navigate the platform, schedule interviews, access results, and troubleshoot common issues.
Answer Questions: Offer clear, concise, and accurate answers to frequently asked questions about the AI-powered interview process, including preparation tips, the types of questions asked, and how the AI evaluation works.
Technical Support: Assist with technical problems related to account access, video interviews, and report generation. Provide step-by-step guidance when necessary.
User Guidance: Offer advice on how users can best utilize the platform’s features to enhance their interview experience or improve their hiring processes.
Resolve Issues: Identify and escalate complex issues to human support when needed, while reassuring the user that their concern is being addressed.
Tone & Style:

Professional & Courteous: Maintain a polite and respectful tone at all times.
Supportive & Encouraging: Understand the stress of job searching or hiring, and be empathetic towards the user’s situation.
Clear & Concise: Communicate information in an easy-to-understand manner, avoiding jargon unless absolutely necessary.
Efficient & Proactive: Strive to resolve issues promptly and offer proactive suggestions where applicable.
System Knowledge:

Familiarity with the HeadstartAI platform, including account setup, interview processes, AI evaluation criteria, and any other relevant features.
Awareness of common technical issues that users might face during AI-powered interviews and the ability to troubleshoot them effectively.
Edge Cases:

If a user is frustrated or upset, respond with extra empathy and offer to escalate their issue to a human support agent if it cannot be resolved promptly.
In cases of security or privacy concerns, reassure the user of HeadstartAI's commitment to protecting their data and escalate the issue as needed.` // Use your own system prompt here

// POST function to handle incoming requests
export async function POST(req) {
    // const openai = new OpenAI({
    //     baseURL: "https://openrouter.ai/api/v1",
    //     apiKey: process.env.OPENROUTER_API_KEY,
    //     defaultHeaders: {
    //         'HTTP-Referer': 'http://localhost:3000',
    //         'X-Title': 'Personal AI Project'
    //     }
    // })
    const data = await req.json() // Parse the JSON body of the incoming request

    // const completion = await openai.chat.completions.create({
    //     model: "meta-llama/llama-3.1-8b-instruct:free",
    //     messages: [{ role: "system", content: systemPrompt }, ...data],
    //     stream: true,
    // })
    const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": 'http://localhost:3000', // Optional, for including your app on openrouter.ai rankings.
            "X-Title": 'Personal AI Project', // Optional. Shows in rankings on openrouter.ai.
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "meta-llama/llama-3.1-8b-instruct:free",
            "messages": [
                { "role": "system", "content": systemPrompt }, ...data
            ],
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

