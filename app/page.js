'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function Home() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const apiKey = "AIzaSyBr1mI21WL76WSKn0zpVRmNCkSuKL9TJvw";

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    // We'll create the object URL in a useEffect hook
  };

  useEffect(() => {
    if (image && typeof window !== 'undefined') {
      // Only create object URL on the client side
      const url = URL.createObjectURL(image);
      setImageUrl(url);

      // Clean up the object URL when component unmounts or image changes
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const captureImage = () => {
    // Implement camera access (using MediaDevices API, for example)
  };

  const identifyPlant = async (file) => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

      const imageBytes = await file.arrayBuffer();
      const base64Image = Buffer.from(imageBytes).toString('base64');

      const prompt = 'Identify this plant and provide its name and a brief description. Please provide the name and description in the following format: "Plant Name: Description: and make it little bit easy to understand for indians but in englesh';

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: file.type,
          },
        },
      ]);

      const responseText = result.response.text();
      // Parse the responseText to extract the name and description
      const [name, ...descriptionParts] = responseText.split('\n\n');
      const description = descriptionParts.join('\n\n');

      setResult({ name, description }); 
    } catch (error) {
      console.error('Error identifying plant:', error);
      setError('Failed to identify plant. Please try again. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (image) {
      identifyPlant(image);
    }
  }, [image]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-green-800">Plant Identifier</h1>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl flex flex-col md:flex-row">
        <div className="md:w-1/2 mb-4 md:mb-0 md:mr-4">
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="Uploaded plant"
                fill
                style={{ objectFit: 'contain' }}
              />
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Upload Image
            </button>
            <button
              onClick={captureImage}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Use Camera
            </button>
          </div>
        </div>
        <div className="md:w-1/2">
          {loading && (
            <p className="mt-4 text-blue-500">Identifying plant...</p>
          )}
          {error && <p className="mt-4 text-red-500">{error}</p>}
          {result && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-2">{result.name}</h2>
              <p className="text-gray-600">{result.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
