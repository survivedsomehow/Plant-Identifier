'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { GoogleGenerativeAI } from '@google/generative-ai';
import CameraComponent from './Component/CameraComponent';

export default function Home() {
  const [image, setImage] = useState(null);
  console.log('Image state:', image);
  const [imageUrl, setImageUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const apiKey = "AIzaSyBr1mI21WL76WSKn0zpVRmNCkSuKL9TJvw";

  const handleImageUpload = (e) => {
    console.log('File uploaded:', e.target.files);
    const file = e.target.files[0];
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleImageCapture = (blob, url) => {
    console.log('Image captured:', blob);
    setImage(blob);
    setImageUrl(url);
  };

  const identifyPlant = async (file) => {
    console.log('Identifying plant...');
    // ... rest of your code ...
  };

  useEffect(() => {
    if (image) {
      console.log('Image uploaded:', image);
      identifyPlant(image);
    }
  }, [image]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-green-800">Plant Identifier</h1>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl flex flex-col md:flex-row">
        <div className="md:w-1/2 mb-4 md:mb-0 md:mr-4">
          <CameraComponent onImageCapture={handleImageCapture} />
          <div className="mt-4 flex justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              onClick={() => console.log('Upload button clicked')}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Upload Image
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
        </
