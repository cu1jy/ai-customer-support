'use client'
import { Box } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?"
    },
  ])
  const [message, setMessage] = useState('')

  const sendMessage = async () => {

  }

  return (
    <Box>

    </Box>
  );
}
