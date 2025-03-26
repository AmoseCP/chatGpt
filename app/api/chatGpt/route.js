import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { NextResponse } from 'next/server';


async function isChristianContent(content, prompt){
  const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] ;
  const azureApiKey = process.env["AZURE_OPENAI_KEY"] ;
  const deploymentId = process.env["AZURE_OPENAI_DEPLOYMENT_ID"];
  const messages = [
    { role: "system", content: prompt },
    { role: "user", content: content},
  ];
  const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
  const result = await client.getChatCompletions(deploymentId, messages);
  return result;
}

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    const { prompt, content, password } = body;
    if (password !== process.env["SPECIAL_PASSWORD_FOR_ADMIN"]) {
      return NextResponse.json(
        { error: 'Invalid password' }, 
        { status: 401 }
      );
    }
    const result = await isChristianContent(content, prompt);
    let response = result. choices[0].message.content
    console.log(response);
    return NextResponse.json({ model: result.model, usage: result.usage, result: response });
  } catch (error) {
    console.error('Error parsing request:', error);
    
    return NextResponse.json(
      { error: 'Failed to parse request body' }, 
      { status: 400 }
    );
  }
}