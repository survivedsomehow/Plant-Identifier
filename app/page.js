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
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const apiKey = process.env.NEXT_PUBLIC_Gemini_API;


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Failed to access camera. Please make sure you've granted permission.");
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        setImage(blob);
        setImageUrl(URL.createObjectURL(blob));
        setShowCamera(false);

        // Stop all video streams
        video.srcObject.getTracks().forEach(track => track.stop());
      }, 'image/jpeg');
    }
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
            {showCamera ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : imageUrl ? (
              <Image
                src={imageUrl}
                alt="Plant image"
                fill
                style={{ objectFit: 'contain' }}
              />
            ) : null}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
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
            {showCamera ? (
              <button
                onClick={captureImage}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Capture
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Use Camera
              </button>
            )}
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
