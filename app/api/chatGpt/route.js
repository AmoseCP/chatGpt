import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { NextResponse } from 'next/server';

export async function isChristianContent(text){
  const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] ;
  const azureApiKey = process.env["AZURE_OPENAI_KEY"] ;
  const deploymentId = process.env["AZURE_OPENAI_DEPLOYMENT_ID"];
  let wordsArray = text.split(' ');
  let first500Words = '';
  if (wordsArray.length <= 500) {
    first500Words = text;
  } else {
    first500Words = wordsArray.slice(0, 500).join(' ');
  }
  if (first500Words === '') {
    return false;
  }
  let prompt = `
You are a text classifier. Analyze the following text and classify it into exactly ONE of these categories:

**Categories:**
- **NEUTRAL**: General content without religious themes or commercial intent
- **CHRISTIAN**: Content that promotes, discusses, or references Christian beliefs, values, practices, or theology in a positive or educational manner
- **ANTI-CHRISTIAN**: Content that criticizes, attacks, or disparages Christian beliefs, practices, or individuals based on their faith
- **ADVERTISEMENT**: Content primarily intended to sell products, services, or promote commercial activities
- **PORNOGRAPHY**: Content that depicts sexual acts, nudity, or sexually explicit material with the primary intent to cause sexual arousal

**Instructions:**
1. Read the text carefully
2. Consider the primary intent and content theme
4. Choose the single most appropriate category
5. Briefly explain your reasoning in 1-2 sentences

Classify the text into one of these categories and return a valid JSON response:

Categories: NEUTRAL, CHRISTIAN, ANTI-CHRISTIAN, ADVERTISEMENT, PORNOGRAPHY
Return format:
{
  "category": "CATEGORY_NAME",
  "confidence": 1-5,
  "reasoning": "Brief explanation",
  "keywords": ["key", "words", "found"]
}

**Text to classify:${first500Words}**
`;
  const messages = [
    { role: "system", content: "You are an AI assistant that helps people classify information." },
    { role: "user", content: prompt },
  ];
  const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
  let result;
  try {
    result = await client.getChatCompletions(deploymentId, messages);
  } catch (error) {
    return false;
  }
  if(result){
    let AIModel = result.model;
    let usage = result.usage;
    let returnResult = {};
    if (result.choices[0].finishReason === 'stop') {
      for (const choice of result.choices) {
        if(choice.message?.content){
          returnResult = detectAndExtractJSON(choice.message.content);
          if(returnResult.success){
            returnResult.data["AIModel"] = AIModel;
            returnResult.data["usage"] = usage;
            return returnResult.data;
          }
        }
      }
    }
    if(result.choices[0].finishReason === 'content_filter' && result.choices[0].contentFilterResults?.hate?.filtered){
      returnResult["category"] = "hate";
      returnResult["reasoning"] = "hate forbidden by AI";
      returnResult["confidence"] = 5;
      returnResult["keywords"] = ["hate", "forbidden", "stop"]
    }
    if(result.choices[0].finishReason === 'content_filter' && result.choices[0].contentFilterResults?.sexual?.filtered){
      returnResult["category"] = "sexual";
      returnResult["reasoning"] = "sexual forbidden by AI";
      returnResult["confidence"] = 5;
      returnResult["keywords"] = ["sexual", "forbidden", "stop"]
    }
    if(result.choices[0].finishReason === 'content_filter' && result.choices[0].contentFilterResults?.violence?.filtered){
      returnResult["category"] = "violence";
      returnResult["reasoning"] = "violence forbidden by AI";
      returnResult["confidence"] = 5;
      returnResult["keywords"] = ["violence", "forbidden", "stop"]
    }      
    if(Object.keys(returnResult).length !== 0){
      returnResult["AIModel"] = AIModel;
      returnResult["usage"] = usage;
      return returnResult;
    }
  }
  return false;
}

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    const { content, password } = body;
    if (password !== process.env["SPECIAL_PASSWORD_FOR_ADMIN"]) {
      return NextResponse.json(
        { error: 'Invalid password' }, 
        { status: 401 }
      );
    }
    const response = await isChristianContent(content);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error parsing request:', error);
    
    return NextResponse.json(
      { error: 'Failed to parse request body' }, 
      { status: 400 }
    );
  }
}

// function parseJSONFromResponse(apiResponse) {
//   try {
//     const jsonMatch = apiResponse?.match(/```json\s*([\s\S]*?)\s*```/);
//     if (jsonMatch) {
//       const jsonString = jsonMatch[1];
//       const jsonObject = JSON.parse(jsonString);
//       return jsonObject;
//     }
//     return apiResponse;
//   } catch (error) {
//     console.error('Error parsing JSON:', error);
//     return null;
//   }
// }

function detectAndExtractJSON(inputString) {
    const cleanString = inputString.trim();
    
    // Pattern 1: Check for markdown code block
    const markdownMatch = cleanString.match(/^`+(?:json\s*)?(.*?)`+$/s);
    if (markdownMatch) {
        try {
            const jsonData = JSON.parse(markdownMatch[1].trim());
            return {
                success: true,
                data: jsonData,
                format: 'markdown',
                detectedPattern: 'markdown code block'
            };
        } catch (error) {
            return { success: false, error: error.message, format: 'markdown' };
        }
    }
    
    // Pattern 2: Check for quoted JSON string
    const quotedMatch = cleanString.match(/^["'](.*?)["']$/s);
    if (quotedMatch) {
        try {
            const jsonData = JSON.parse(quotedMatch[1]);
            return {
                success: true,
                data: jsonData,
                format: 'quoted',
                detectedPattern: 'quoted JSON string'
            };
        } catch (error) {
            return { success: false, error: error.message, format: 'quoted' };
        }
    }
    
    // Pattern 3: Try direct JSON parsing
    try {
        const jsonData = JSON.parse(cleanString);
        return {
            success: true,
            data: jsonData,
            format: 'direct',
            detectedPattern: 'direct JSON'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            format: 'unknown',
            detectedPattern: 'none'
        };
    }
}