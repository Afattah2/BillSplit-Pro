
import React, { useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError("Image is too large. Please select a photo smaller than 15MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.onerror = () => {
        setError("Failed to read the selected file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCamera = () => {
    setError(null);
    cameraInputRef.current?.click();
  };

  const triggerGallery = () => {
    setError(null);
    galleryInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto p-10 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Scan Receipt</h2>
        <p className="text-slate-500 text-sm font-medium">Capture your bill to start the split</p>
      </div>
      
      <div className="w-full space-y-4">
        {/* Hidden Inputs for specific behaviors */}
        <input 
          ref={cameraInputRef}
          type="file" 
          accept="image/*" 
          capture="environment" 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <input 
          ref={galleryInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className="hidden" 
        />

        {/* Action Buttons */}
        <button 
          onClick={triggerCamera}
          className="group relative flex flex-col items-center justify-center w-full py-10 bg-indigo-600 text-white rounded-3xl font-bold shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.97] transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="bg-white/10 p-5 rounded-2xl mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-xl tracking-wide">Open Camera</span>
        </button>
        
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-black tracking-[0.2em]">or</span></div>
        </div>

        <button 
          onClick={triggerGallery}
          className="flex items-center justify-center w-full py-5 bg-slate-50 text-slate-600 rounded-2xl font-bold border-2 border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upload Existing
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl w-full text-center font-semibold border border-red-100 animate-bounce">
          {error}
        </div>
      )}

      <div className="pt-2 flex flex-col items-center gap-1 text-slate-300">
        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[10px] uppercase font-bold tracking-widest">Privacy First</span>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
