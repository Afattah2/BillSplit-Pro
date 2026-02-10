
import React, { useState, useRef } from 'react';
import CameraCapture from './components/CameraCapture';
import PersonManager from './components/PersonManager';
import AssignmentGrid from './components/AssignmentGrid';
import Summary, { SummaryHandle } from './components/Summary';
import { extractReceiptData } from './services/geminiService';
import { ReceiptData, Person, ItemAssignment } from './types';

enum Step {
  CAPTURE,
  PEOPLE,
  ASSIGN,
  SUMMARY
}

interface ConfirmConfig {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.CAPTURE);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [placeName, setPlaceName] = useState<string>('');
  const [assignments, setAssignments] = useState<ItemAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  
  const summaryRef = useRef<SummaryHandle>(null);

  const handleCapture = async (base64: string) => {
    setIsLoading(true);
    setError(null);
    setCapturedImage(base64);
    try {
      const data = await extractReceiptData(base64);
      setReceiptData(data);
      setAssignments(data.items.map(item => ({ itemId: item.id, portions: {} })));
      setCurrentStep(Step.PEOPLE);
    } catch (err) {
      setError("Failed to process receipt. Please try another photo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (summaryRef.current) {
      setIsExporting(true);
      await summaryRef.current.sharePDF();
      setIsExporting(false);
    }
  };

  const addPerson = (name: string) => {
    const newPerson = { id: `person-${Date.now()}`, name };
    setPeople([...people, newPerson]);
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    setAssignments(assignments.map(a => {
      const newPortions = { ...a.portions };
      delete newPortions[id];
      return { ...a, portions: newPortions };
    }));
  };

  const updatePortion = (itemId: string, personId: string, delta: number) => {
    const item = receiptData?.items.find(i => i.id === itemId);
    const maxQuantity = item?.quantity || 1;

    setAssignments(prev => prev.map(a => {
      if (a.itemId === itemId) {
        const otherPortionsTotal = (Object.entries(a.portions) as [string, number][])
          .filter(([pid]) => pid !== personId)
          .reduce((sum, [, qty]) => sum + qty, 0);

        const currentCount = a.portions[personId] || 0;
        let newCount = currentCount + delta;

        if (newCount + otherPortionsTotal > maxQuantity) {
            newCount = maxQuantity - otherPortionsTotal;
        }
        
        newCount = Math.max(0, newCount);
        
        const newPortions = { ...a.portions };
        if (newCount === 0) {
          delete newPortions[personId];
        } else {
          newPortions[personId] = newCount;
        }
        
        return { ...a, portions: newPortions };
      }
      return a;
    }));
  };

  const toggleAssignment = (itemId: string, personId: string) => {
    const item = receiptData?.items.find(i => i.id === itemId);
    const maxQuantity = item?.quantity || 1;

    setAssignments(prev => prev.map(a => {
      if (a.itemId === itemId) {
        const isAssigned = !!a.portions[personId];
        const currentTotal = (Object.values(a.portions) as number[]).reduce((a, b) => a + b, 0);
        
        const newPortions = { ...a.portions };
        
        if (isAssigned) {
          delete newPortions[personId];
        } else {
          if (currentTotal < maxQuantity) {
             newPortions[personId] = 1;
          }
        }
        
        return { ...a, portions: newPortions };
      }
      return a;
    }));
  };

  const handleFinishSplit = () => {
    if (!receiptData) {
      setCurrentStep(Step.SUMMARY);
      return;
    }

    const hasUnassigned = receiptData.items.some(item => {
      const assignment = assignments.find(a => a.itemId === item.id);
      const totalPortions = (Object.values(assignment?.portions || {}) as number[]).reduce((a, b) => a + b, 0);
      return totalPortions < item.quantity;
    });

    if (hasUnassigned) {
      setConfirmConfig({
        title: "Unassigned Items",
        message: "There are still unassigned items. Do you want to continue?",
        confirmLabel: "Yes, Continue",
        cancelLabel: "No, Go Back",
        onConfirm: () => {
          setCurrentStep(Step.SUMMARY);
          setConfirmConfig(null);
        }
      });
    } else {
      setCurrentStep(Step.SUMMARY);
    }
  };

  const handleRestart = () => {
    setConfirmConfig({
      title: "Start Over?",
      message: "This will clear all items and progress. Are you sure?",
      confirmLabel: "Restart",
      cancelLabel: "Cancel",
      onConfirm: () => {
        setCurrentStep(Step.CAPTURE);
        setReceiptData(null);
        setPeople([]);
        setAssignments([]);
        setPlaceName('');
        setConfirmConfig(null);
      }
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="space-y-1">
            <p className="text-slate-800 font-black text-lg">Processing Receipt</p>
            <p className="text-slate-500 text-sm">Gemini AI is reading your items...</p>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case Step.CAPTURE:
        return (
          <div className="space-y-6 pb-12 relative">
            <div className="absolute top-[-100px] left-[-16px] right-[-16px] h-[640px] overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-slate-50 z-10" />
               <img 
                 src="https://i.postimg.cc/Y94ZTFFc/Whats-App-Image-2026-02-09-at-8-15-30-PM.jpg" 
                 alt="Cinematic dining experience" 
                 className="w-full h-full object-cover object-center scale-105 animate-soft-zoom"
                 onError={(e) => {
                   e.currentTarget.src = "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2074&auto=format&fit=crop";
                 }}
               />
               <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-50 to-transparent z-20" />
            </div>
            
            <div className="relative z-30 pt-[440px]">
              <div className="transform transition-all duration-700 hover:scale-[1.01] max-w-md mx-auto">
                <CameraCapture onCapture={handleCapture} />
              </div>
            </div>

            {error && (
              <div className="relative z-30 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center text-sm font-bold mx-2 shadow-lg max-w-md mx-auto mt-4">
                {error}
              </div>
            )}
          </div>
        );

      case Step.PEOPLE:
        return (
          <div className="max-w-2xl mx-auto space-y-6 pb-24 px-1">
            <PersonManager 
              people={people} 
              placeName={placeName}
              setPlaceName={setPlaceName}
              onAdd={addPerson} 
              onRemove={removePerson} 
            />
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-between items-center z-50">
              <button 
                onClick={handleRestart}
                className="text-slate-400 font-bold text-sm px-4"
              >
                Back
              </button>
              <button 
                onClick={() => setCurrentStep(Step.ASSIGN)}
                disabled={people.length === 0}
                className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 disabled:opacity-30 disabled:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Assign Items
              </button>
            </div>
          </div>
        );

      case Step.ASSIGN:
        return (
          <div className="max-w-4xl mx-auto space-y-6 pb-32 px-1">
            <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Assign Items</h2>
                  {placeName && <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider">{placeName}</p>}
                  <p className="text-slate-500 text-xs mt-1">Portions are limited to item quantity. Add +/- to adjust units.</p>
                </div>
                {capturedImage && (
                  <button 
                    onClick={() => setShowImagePreview(!showImagePreview)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs border border-slate-100 active:bg-slate-100 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {showImagePreview ? 'Hide Photo' : 'Show Photo'}
                  </button>
                )}
              </div>

              {showImagePreview && capturedImage && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                  <img src={capturedImage} alt="Receipt" className="max-h-80 w-full object-contain" />
                </div>
              )}

              {receiptData && (
                <AssignmentGrid 
                  receiptData={receiptData}
                  people={people}
                  assignments={assignments}
                  onToggleAssignment={toggleAssignment}
                  onUpdatePortion={updatePortion}
                />
              )}
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-between items-center z-50">
              <button 
                onClick={() => setCurrentStep(Step.PEOPLE)}
                className="text-slate-400 font-bold text-sm px-4"
              >
                Back
              </button>
              <button 
                onClick={handleFinishSplit}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Finish Split
              </button>
            </div>
          </div>
        );

      case Step.SUMMARY:
        return (
          <div className="max-w-4xl mx-auto pb-24 px-1">
            {receiptData && (
              <Summary 
                ref={summaryRef}
                receiptData={receiptData}
                people={people}
                placeName={placeName}
                assignments={assignments}
              />
            )}
            
            <div className="mt-12 space-y-6 max-w-sm mx-auto px-4">
              <button
                onClick={handleShare}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-3xl font-black text-base shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share Split as PDF</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setCurrentStep(Step.ASSIGN)}
                  className="bg-white border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button 
                  onClick={() => {
                    setReceiptData(null);
                    setPeople([]);
                    setAssignments([]);
                    setCapturedImage(null);
                    setPlaceName('');
                    setCurrentStep(Step.CAPTURE);
                  }}
                  className="bg-indigo-50 text-indigo-700 py-4 rounded-2xl font-black text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  New
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 overflow-x-hidden">
      <header className={`py-3 sm:py-4 sticky top-0 z-50 px-safe transition-all duration-500 border-b ${
        currentStep === Step.CAPTURE 
          ? 'bg-transparent border-transparent shadow-none' 
          : 'bg-white/80 backdrop-blur-md border-slate-100 shadow-sm'
      }`}>
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-3">
          <div className="relative h-8 flex items-center">
            {currentStep !== Step.CAPTURE && (
              <div 
                className="p-1.5 rounded-lg cursor-pointer active:scale-90 transition-all bg-indigo-600 opacity-100 scale-100"
                onClick={handleRestart}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center rounded-lg transition-all duration-500 ${
              currentStep === Step.CAPTURE ? 'w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 shadow-[0_4px_12px_rgba(79,70,229,0.5)]' : 'w-7 h-7 sm:w-8 sm:h-8 bg-indigo-600'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className={`text-xl font-black tracking-tight transition-all duration-500 ${
              currentStep === Step.CAPTURE ? 'text-white drop-shadow-md' : 'text-black'
            }`}>
              الحساب يجمع
            </h1>
          </div>
        </div>
      </header>

      <main className={`max-w-6xl mx-auto px-4 ${currentStep === Step.CAPTURE ? 'pt-0' : 'pt-6'}`}>
        {renderContent()}
      </main>

      {/* Custom Confirmation Modal */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            onClick={() => setConfirmConfig(null)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-black/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">{confirmConfig.title}</h2>
            <p className="text-slate-500 font-bold leading-relaxed mb-8">{confirmConfig.message}</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setConfirmConfig(null)}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-all"
              >
                {confirmConfig.cancelLabel || "Cancel"}
              </button>
              <button 
                onClick={confirmConfig.onConfirm}
                className="w-full bg-slate-50 text-slate-500 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all"
              >
                {confirmConfig.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="py-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
        <span className="text-black/40">الحساب يجمع</span> &bull; {new Date().getFullYear()}
      </footer>

      <style>{`
        @keyframes soft-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-soft-zoom {
          animation: soft-zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;
