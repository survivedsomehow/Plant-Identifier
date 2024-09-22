import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request) {
  try {
    console.log('API route called');
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      console.error('No image provided');
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Image received:', image.name, image.type, image.size);

    const apiKey = 'AIzaSyBr1mI21WL76WSKn0zpVRmNCkSuKL9TJvw';
    if (!apiKey) {
      console.error('Google API key is not set');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Initializing Google AI');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `Hey there! Can you help me identify this plant? Please provide the common name, scientific name, a brief description, growth conditions (including light, water, and soil requirements), and any essential care tips. Format your answer like this:

{
  "plantName": "",
  "scientificName": "",
  "description": "",
  "growthConditions": {
    "light": "",
    "water": "",
    "soil": ""
  },
  "careInstructions": ""
}

I'd really appreciate it if you could fill in the details for me! Thanks in advance!`;

    console.log('Converting image to byte array');
    const imageBytes = await image.arrayBuffer();
    const base64Image = Buffer.from(imageBytes).toString('base64');

    console.log('Calling Gemini API');
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: image.type
          }
        }
      ]);
      console.log('Gemini API response received');
      const response = result.response;
      const text = response.text();

      console.log('Parsing Gemini API response');
      console.log('Raw response:', text);
      const [name, ...descriptionParts] = text.split('\n\n');
      const description = descriptionParts.join('\n\n');

      console.log('Sending response');
      return new Response(JSON.stringify({ name, description }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
