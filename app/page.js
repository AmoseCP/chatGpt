'use client'

import React, { useState } from 'react';

export default function Home() {
    const [content, setContent] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState('');
    const handleSubmit =  async(e) => {
      e.preventDefault();
      const response = await fetch('/api/chatGpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        alert(error.error);
        return;
      }
      const data = await response.json();
      setResult(data);
    }
    
return (
  <div>
     <div className="flex flex-col items-center justify-center bg-amber-500 min-h-16 py-4">
      <div className="text-center"><h1>God said, &quot;Let there be light,&quot; and there was light.</h1></div>
      <div className="text-center text-2xl"><h1>Genesis 1:3 NIV</h1></div>
     </div>
     {result && (
        <>
          <div className="flex font-bold items-center justify-center bg-gray-100 mx-auto p-4">
            <div className="max-w-2xl text-center text-red-600">Test Results: </div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-100 w-full p-4">
            <div className="max-w-4xl w-full grid grid-cols-2 gap-4">
              <div className="text-right">Conclusion, it is:</div>
              <div className="font-bold">{result.category}</div>
              
              <div className="text-right">Reason:</div>
              <div className="font-bold">{result.reasoning}</div>
              
              <div className="text-right">Confidence:</div>
              <div className="font-bold">{result.confidence}</div>
              
              <div className="text-right">Key words:</div>
              <div className="font-bold">{result.keywords.join(', ')}</div>
              <div className="text-right">CompletionTokens used:</div>
              <div className="font-bold">{result.usage.completionTokens}</div>
              
              <div className="text-right">Prompt Tokens used:</div>
              <div className="font-bold">{result.usage.promptTokens}</div>
              
              <div className="text-right">Total Tokens used:</div>
              <div className="font-bold">{result.usage.totalTokens}</div>
              <div className="text-right">AI model used:</div>
              <div className="font-bold">{result.usage.AIModel}</div>
            </div>
          </div>
        </>
      )}
     <div className="min-h-screen flex justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Check the Articles with AI
          </h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            Please provide the content you want to check.
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="content" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Article Content
              </label>
              <textarea 
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                placeholder="The content you want to classify."
              />
            </div>

            <div>
              <label 
                htmlFor="subtitle" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input 
                id="subtitle"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password here"
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://blogs.crossmap.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Copy Right © Crossmap Blogs</span>
      </a>
    </footer>
  </div>);
}
