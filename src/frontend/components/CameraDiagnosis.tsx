"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, X, Check, Upload, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface CameraDiagnosisProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export const CameraDiagnosis: React.FC<CameraDiagnosisProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: "environment" } }
      });
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError") {
        setCameraError("Camera access was denied. Please allow camera permission in your browser settings, or use the Upload button below.");
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on this device. Use the Upload button below to select a photo from your files.");
      } else {
        setCameraError("Could not access camera. Use the Upload button below instead.");
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        canvas.toBlob((blob) => {
          if (blob) setCapturedBlob(blob);
        }, "image/jpeg");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setCapturedImage(imageUrl);
    setCapturedBlob(file);
  };

  const confirmPhoto = () => {
    if (capturedBlob) {
      onCapture(capturedBlob);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="relative flex-1 overflow-hidden flex items-center justify-center">
        {!capturedImage ? (
          cameraError ? (
            /* Camera error / fallback UI */
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center">
                <AlertCircle size={40} className="text-amber-400" />
              </div>
              <p className="text-white/80 text-sm max-w-sm">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 bg-emerald-600 px-6 py-3 rounded-full text-white font-semibold shadow-lg shadow-emerald-600/30 active:scale-95 transition-all hover:bg-emerald-500"
              >
                <Upload size={20} />
                Upload Photo
              </button>
            </div>
          ) : (
            /* Live camera preview */
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          )
        ) : (
          /* Captured/uploaded image preview */
          <img src={capturedImage} className="w-full h-full object-cover" alt="Captured plant" />
        )}
        
        <canvas ref={canvasRef} className="hidden" />

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-full bg-white/20 backdrop-blur-md text-white active:scale-90 transition-transform"
        >
          <X size={24} />
        </button>
      </div>

      <div className="h-40 bg-zinc-900/90 backdrop-blur-xl flex items-center justify-around px-8">
        {!capturedImage ? (
          <>
            {/* Upload from gallery */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-full bg-zinc-800 text-white active:scale-90 transition-transform"
            >
              <Upload size={28} />
            </button>

            {/* Camera shutter - only show if camera is working */}
            {!cameraError ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-white transition-opacity active:opacity-50" />
              </motion.button>
            ) : (
              <div className="w-16" />
            )}

            {/* Spacer */}
            <div className="w-14" />
          </>
        ) : (
          <>
            <button 
              onClick={retakePhoto}
              className="p-4 rounded-full bg-zinc-800 text-white active:scale-90"
            >
              <RefreshCw size={28} />
            </button>
            <button 
              onClick={confirmPhoto}
              className="p-4 rounded-full bg-emerald-500 text-white active:scale-90 shadow-lg shadow-emerald-500/20"
            >
              <Check size={28} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};
