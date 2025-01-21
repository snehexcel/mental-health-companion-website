import { useState } from 'react';
import '../App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { API_KEY } from './config.js';

const systemMessage = { 
  "role": "system", 
  "content": "Explain things like you're talking to a software professional with 2 years of experience."
};

function ChatBot() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Mental Health Bot! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    // Indicate that the bot is typing
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    // Format messages for ChatGPT API
    let apiMessages = chatMessages.map((messageObject) => {
      let role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
      return { role: role, content: messageObject.message };
    });

    // Prepare the API request body
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      // Update messages with the bot's response
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      
      // Optionally, you can add an error message to the chat
      setMessages([...chatMessages, {
        message: "Sorry, I couldn't process your request. Please try again.",
        sender: "ChatGPT"
      }]);
      
    } finally {
      setIsTyping(false); // Ensure typing indicator is turned off
    }
  }

  return (
    <div id='bot' style={{ height: "32rem", width: "25rem", marginLeft:"70%", marginRight:"50%" }}>
      <MainContainer style={{ borderRadius:"12px", boxShadow: "2px 2px 10px 1px #333" }}>
        <ChatContainer>       
          <MessageList
            scrollBehavior="smooth" 
            typingIndicator={isTyping ? <TypingIndicator content="Mental Health Bot is typing" /> : null}
          >
            {messages.map((message, i) => (
              <Message key={i} model={message} />
            ))}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend} />        
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default ChatBot;
