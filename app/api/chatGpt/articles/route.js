import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function delay(s) {
  return new Promise(resolve => setTimeout(resolve, 1000 * s));
}

async function writeFileContent(fileName, content) {
  fs.appendFile(fileName, content + '\n')
}

async function readFileContent(fileName) {
  const filePath = path.join(process.cwd(), `app/api/chatGpt/articles/${fileName}`);
  console.log('Attempting to read file:', filePath.split('/').pop());
  const fileContents = await fs.readFile(filePath, 'utf8');
  return fileContents;
}


async function isChristianContent(content, prompt="Your are an AI assistant that helps people find information."){
  const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] ;
  const azureApiKey = process.env["AZURE_OPENAI_KEY"] ;
  const deploymentId = process.env["AZURE_OPENAI_DEPLOYMENT_ID"];
  content = `
Classify the text into neutral, christian or anti-christian or advertisement. 
Text: For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.
Sentiment: christian
Classify the text into neutral, christian or anti-christian or advertisement. 
Text: ${content}
Sentiment:
  `;

  const messages = [
    { role: "system", content: prompt },
    { role: "user", content: content },
  ];
  const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
  const result = await client.getChatCompletions(deploymentId, messages);
  for (const choice of result?.choices) {
    if (choice.message.content?.toLowerCase()?.includes('anti-christian')){
      return 'anti-christian';
    } else if(choice?.message?.content?.toLowerCase()?.startsWith('advertisement')){
      return 'advertisement';
    } else if (choice?.message?.content?.toLowerCase()?.includes('neutral')){
      return 'neutral';
    } else {
      return "pass";
    }
  }
  return "pass";
}

export async function POST(request) {
  try {
    const filePath = path.join(process.cwd(), `app/api/chatGpt/articles/result.txt`);
    for(let j = 0; j < 100; j ++){
      await writeFileContent(filePath, `*********************${j+1}*********************`);
      for(let i = 1; i <= 100; i++){
        await delay(5);
        let fileName = i + ".txt";
        let content =  await readFileContent(fileName);
        let result;
        try {
          result = await isChristianContent(content);
        } catch (err){
          result = err.message;
        } 
        await writeFileContent(filePath, `file${i}`+'\t'+ result);
      }
    }
    
    

    // test a specific file separately

    // let fileName = "29.txt";
    // let content =  await readFileContent(fileName);
    // let result;
    // try {
    //       result = await isChristianContent(content);
    // } catch (err){
    //   console.log(`== err ==>`,  err.message);
    //   result = err.message;
    // } 
    // const filePath = path.join(process.cwd(), `app/api/chatGpt/articles/result.txt`);
    // await writeFileContent(filePath, `file${fileName}`+'\t'+ result);

    return NextResponse.json({ message: 'Tasks completed successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 400 }
    );
  }
}

// export async function POST(request) {
//   try {
//     const body = await request.json();
    
//     const { prompt, content, password } = body;
//     if (password !== process.env["SPECIAL_PASSWORD_FOR_ADMIN"]) {
//       return NextResponse.json(
//         { error: 'Invalid password' }, 
//         { status: 401 }
//       );
//     }
//     const result = await isChristianContent(content, prompt);
//     let response = result. choices[0].message.content
//     console.log(response);
//     return NextResponse.json({ model: result.model, usage: result.usage, result: response });
//   } catch (error) {
//     console.error('Error parsing request:', error);
    
//     return NextResponse.json(
//       { error: 'Failed to parse request body' }, 
//       { status: 400 }
//     );
//   }
// }