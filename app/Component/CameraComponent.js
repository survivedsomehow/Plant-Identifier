'use client'

import React, { useState, useRef } from 'react';
import Image from 'next/image';

export default function CameraComponent({ onImageCapture }) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const openCamera = async (e) => {
    e.preventDefault();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraOpen(true);
      }
    } catch (error) {
      if (error.name === 'NotFoundError') {
        console.error('No camera device found:', error);
        alert('No camera device found. Please ensure that your device has a camera and that camera access is allowed.');
      } else if (error.name === 'NotAllowedError') {
        console.error('Camera access denied:', error);
        alert('Camera access denied. Please allow camera access to use this feature.');
      } else {
        console.error('Error accessing camera:', error);
        alert('An error occurred while accessing the camera. Please try again later.');
      }
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setIsCameraOpen(false);
        if (videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        onImageCapture(blob, url);
      });
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
        {isCameraOpen ? (
          <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt="Captured image"
            fill
            style={{ objectFit: 'contain' }}
          />
        ) : null}
      </div>
      <canvas ref={canvasRef} className="hidden" width="640" height="480" />
      <div className="mt-4 flex justify-center">
        {isCameraOpen ? (
          <button
            onClick={captureImage}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Capture
          </button>
        ) : (
          <button
            onClick={openCamera}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Use Camera
          </button>
        )}
      </div>
    </div>
  );
}
