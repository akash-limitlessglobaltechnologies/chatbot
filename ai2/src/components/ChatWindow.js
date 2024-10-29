import React, { useState } from 'react';
import axios from 'axios';
import Preview from './Preview';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there, problem-solving superhero! 🦸‍♂️ What's your secret identity (aka your name)?", sender: "bot" },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState('name');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(null);

  const geminiPrompt = `You are a problem-solving AI assistant named LGT (Limitless Global Technologies) Bot. Your goal is to help users on their 0 to 1 journey by understanding their problems and providing creative solutions. Be friendly, encouraging, and use a touch of humor when appropriate. Always strive to understand the problem fully before suggesting solutions.

  When providing code or UI components, follow these guidelines:
  1. Start the code block with "\`\`\`[type]" where [type] is one of: react, html, css, tailwind, javascript.
  2. End the code block with "\`\`\`".
  3. Immediately after the code block, provide a description of what the code does and how it would appear visually, starting with "OUTPUT_START:" and ending with "OUTPUT_END".
  4. For React components, provide a complete functional component.
  5. For HTML, provide a complete structure including <html>, <head>, and <body> tags.
  6. For CSS, provide complete styles including selectors.
  7. For Tailwind, provide a single div with Tailwind classes.
  8. For JavaScript, provide runnable code that demonstrates the concept.
  9. If code is type react, write CSS in the React component only, and the type should be react only if CSS is included in the React code.
  10. If your response includes any code (react, css, html, javascript), start your message with "#preview".
  11. write css in the react component only dont add any other files, just direct use CSS.
  

  Ask follow-up questions when necessary to gather more information. When providing solutions, consider the user's specific situation, constraints, and target audience. Offer innovative ideas and be open to refining the solution based on user feedback. Remember to keep the conversation engaging and interactive. Current conversation stage: ${stage}. User's name: ${userName}. User's email: ${userEmail}.`;

  const callGeminiAPI = async (prompt) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [{ parts: [{ text: `${geminiPrompt}\n\nUser: ${prompt}\n\nLGT Bot:` }] }],
        },
        {
          params: {
            key: process.env.REACT_APP_GEMINI_API_KEY,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const botReply = response.data.candidates[0].content.parts[0].text;
      
      // Parse the response to extract code blocks and outputs
      const codeBlockMatch = botReply.match(/```(\w+)\n([\s\S]*?)```\s*OUTPUT_START:([\s\S]*?)OUTPUT_END/);
      let processedReply = botReply;
      let codeSnippet = null;

      if (codeBlockMatch) {
        const [fullMatch, type, code, output] = codeBlockMatch;
        codeSnippet = { type, code: code.trim(), output: output.trim() };
        processedReply = processedReply.replace(fullMatch, '');
      }

      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: prevMessages.length + 1, 
          text: processedReply, 
          sender: 'bot',
          codeSnippet,
          hasPreview: processedReply.includes('#preview')
        }
      ]);

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages(prevMessages => [...prevMessages, { id: prevMessages.length + 1, text: "Oops! My circuits got a bit tangled there. Could you please try again?", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      const userMessage = { id: messages.length + 1, text: inputMessage, sender: 'user' };
      setMessages([...messages, userMessage]);
      setInputMessage('');

      if (stage === 'name') {
        setUserName(inputMessage);
        setStage('email');
        await callGeminiAPI(`The user's name is ${inputMessage}. Ask for their email in a fun way.`);
      } else if (stage === 'email') {
        setUserEmail(inputMessage);
        setStage('problem_statement');
        await callGeminiAPI(`The user's email is ${inputMessage}. Ask for their problem statement.`);
      } else {
        await callGeminiAPI(inputMessage);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 overflow-hidden font-mono">
      <div className="bg-gray-800 p-4 text-green-400 font-bold text-lg">
        &lt;limitless🤖Bot/&gt;
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-700 text-green-400'
              } text-sm`}
            >
              {message.text}
              {message.hasPreview && message.codeSnippet && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setCurrentPreview(message.codeSnippet);
                      setShowPreview(true);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Preview Code
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-green-400 p-2 rounded-lg text-sm">
              ...
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-800">
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-gray-700 text-green-400 rounded-l-lg px-4 py-2 focus:outline-none text-sm"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-green-500 text-black px-4 py-2 rounded-r-lg hover:bg-green-600 focus:outline-none text-sm font-bold"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
      <Preview
        currentPreview={currentPreview}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
      />
    </div>
  );
};

export default ChatWindow;
