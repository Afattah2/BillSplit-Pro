
import React, { useState, useRef } from 'react';
import CameraCapture from './components/CameraCapture';
import PersonManager from './components/PersonManager';
import AssignmentGrid from './components/AssignmentGrid';
import Summary, { SummaryHandle } from './components/Summary';
import GoogleAdsBanner from './components/GoogleAdsBanner';
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
  onCancel?: () => void;
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
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const summaryRef = useRef<SummaryHandle>(null);

  const handleCapture = async (base64: string) => {
    setIsLoading(true);
    setError(null);
    setCapturedImage(base64);
    try {
      const data = await extractReceiptData(base64);
      setReceiptData(data);
      setAssignments(data.items.map(item => ({ itemId: item.id, portions: {}, isFreeSplit: false })));
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

  const toggleFreeSplit = (itemId: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.itemId === itemId) {
        const isNowFree = !a.isFreeSplit;
        const item = receiptData?.items.find(i => i.id === itemId);
        const maxQty = item?.quantity || 1;

        let newPortions = { ...a.portions };
        
        if (!isNowFree) {
          // If switching back to portion split, we must ensure we don't exceed physical quantity
          // Explicitly cast Object.entries to fix "unknown" type error on qty variable at line 98
          const portions = Object.entries(newPortions) as [string, number][];
          let currentSum = 0;
          const cappedPortions: Record<string, number> = {};
          
          for (const [pid, qty] of portions) {
            if (currentSum < maxQty) {
              const available = maxQty - currentSum;
              const actual = Math.min(qty, available);
              if (actual > 0) {
                cappedPortions[pid] = actual;
                currentSum += actual;
              }
            }
          }
          newPortions = cappedPortions;
        } else {
          // If switching to free split, all existing assignments become 1 share
          Object.keys(newPortions).forEach(pid => {
            newPortions[pid] = 1;
          });
        }

        return { ...a, isFreeSplit: isNowFree, portions: newPortions };
      }
      return a;
    }));
  };

  const updatePortion = (itemId: string, personId: string, delta: number) => {
    const assignment = assignments.find(a => a.itemId === itemId);
    if (assignment?.isFreeSplit) return; // Portions ignored in free split

    const item = receiptData?.items.find(i => i.id === itemId);
    const maxQuantity = item?.quantity || 1;

    setAssignments(prev => prev.map(a => {
      if (a.itemId === itemId) {
        const otherPortionsTotal = (Object.entries(a.portions) as [string, number][])
          .filter(([pid]) => pid !== personId)
          .reduce((sum, [, qty]) => sum + qty, 0);

        const currentCount = a.portions[personId] || 0;
        let newCount = currentCount + delta;

        // Cap at physical quantity
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
    const assignment = assignments.find(a => a.itemId === itemId);
    const item = receiptData?.items.find(i => i.id === itemId);
    const maxQuantity = item?.quantity || 1;

    setAssignments(prev => prev.map(a => {
      if (a.itemId === itemId) {
        const isAssigned = !!a.portions[personId];
        const newPortions = { ...a.portions };
        
        if (isAssigned) {
          delete newPortions[personId];
        } else {
          if (a.isFreeSplit) {
            // Free split ignores physical quantity limit
            newPortions[personId] = 1;
          } else {
            const currentTotal = (Object.values(a.portions) as number[]).reduce((a, b) => a + b, 0);
            if (currentTotal < maxQuantity) {
               newPortions[personId] = 1;
            }
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
      
      if (assignment?.isFreeSplit) {
        return totalPortions === 0;
      }
      return totalPortions < item.quantity;
    });

    if (hasUnassigned) {
      setConfirmConfig({
        title: "Unassigned Items",
        message: "There are still items not fully assigned based on their quantity. Continue?",
        confirmLabel: "Yes, Continue",
        cancelLabel: "No, Go Back",
        onConfirm: () => {
          setCurrentStep(Step.SUMMARY);
          setConfirmConfig(null);
        },
        onCancel: () => {
          setShowValidationErrors(true);
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
        setShowValidationErrors(false);
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
          <div className="flex flex-col gap-6 relative">
            <div className="absolute top-0 left-[-16px] right-[-16px] h-[580px] overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-slate-50 z-10" />
               <img 
                 src="https://i.postimg.cc/Y94ZTFFc/Whats-App-Image-2026-02-09-at-8-15-30-PM.jpg" 
                 alt="Cinematic dining experience" 
                 className="w-full h-full object-cover object-center scale-105 animate-soft-zoom"
               />
               <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-50 to-transparent z-20" />
            </div>
            <div className="relative z-30 pt-[460px]">
              <div className="transform transition-all duration-700 hover:scale-[1.01] max-w-md mx-auto">
                <CameraCapture onCapture={handleCapture} />
              </div>
            </div>
          </div>
        );

      case Step.PEOPLE:
        return (
          <div className="max-w-2xl mx-auto flex flex-col gap-6 px-1">
            <PersonManager 
              people={people} 
              placeName={placeName}
              setPlaceName={setPlaceName}
              onAdd={addPerson} 
              onRemove={removePerson} 
            />
            <div className="fixed left-0 right-0 bottom-[72px] sm:bottom-[112px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-between items-center z-50">
              <button onClick={handleRestart} className="text-slate-400 font-bold text-sm px-4">Restart</button>
              <button 
                onClick={() => setCurrentStep(Step.ASSIGN)}
                disabled={people.length === 0}
                className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 disabled:opacity-30 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Assign Items
              </button>
            </div>
          </div>
        );

      case Step.ASSIGN:
        return (
          <div className="max-w-4xl mx-auto flex flex-col gap-6 px-1">
            <div className="bg-white p-5 sm:p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Assign Items</h2>
                  <p className="text-slate-500 text-xs mt-1">Assign portions or use "Free Split" to share equally.</p>
                </div>
                {capturedImage && (
                  <button onClick={() => setShowImagePreview(!showImagePreview)} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-2xl font-bold text-xs">
                    {showImagePreview ? 'Hide Photo' : 'Show Photo'}
                  </button>
                )}
              </div>
              {showImagePreview && capturedImage && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
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
                  onToggleFreeSplit={toggleFreeSplit}
                  highlightUnassigned={showValidationErrors}
                />
              )}
            </div>
            <div className="fixed left-0 right-0 bottom-[72px] sm:bottom-[112px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-between items-center z-50">
              <button onClick={() => setCurrentStep(Step.PEOPLE)} className="text-slate-400 font-bold text-sm px-4">Back</button>
              <button onClick={handleFinishSplit} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">
                Finish Split
              </button>
            </div>
          </div>
        );

      case Step.SUMMARY:
        return (
          <div className="max-w-4xl mx-auto flex flex-col gap-12 px-1">
            {receiptData && <Summary ref={summaryRef} receiptData={receiptData} people={people} placeName={placeName} assignments={assignments} />}
            <div className="flex flex-col gap-6 max-w-sm mx-auto px-4">
              <button onClick={handleShare} disabled={isExporting} className="w-full bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all">
                {isExporting ? 'Generating...' : 'Share Split as PDF'}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setCurrentStep(Step.ASSIGN)} className="bg-white border border-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs">Edit</button>
                <button onClick={() => {
                  setReceiptData(null); setPeople([]); setAssignments([]); setCapturedImage(null); setPlaceName(''); setCurrentStep(Step.CAPTURE); setShowValidationErrors(false);
                }} className="bg-indigo-50 text-indigo-700 py-4 rounded-2xl font-black text-xs">New</button>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden flex flex-col gap-0 pb-20 sm:pb-24">
      <header className="py-2 sticky top-0 z-50 px-safe transition-all border-b bg-white border-slate-100 shadow-sm flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20">
              <img src="https://i.postimg.cc/L8RmBZ5T/Chat-GPT-Final-2.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-black">الحساب يجمع</h1>
          </div>
        </div>
      </header>
      <main className={`max-w-6xl mx-auto px-4 flex-1 w-full py-8 ${currentStep === Step.PEOPLE || currentStep === Step.ASSIGN ? 'pb-40 sm:pb-48' : ''}`}>{renderContent()}</main>
      <GoogleAdsBanner
        adFormat="auto"
        className="no-print"
      />
      {confirmConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-3">{confirmConfig.title}</h2>
            <p className="text-slate-500 font-bold mb-8">{confirmConfig.message}</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmConfig.onCancel || (() => setConfirmConfig(null))} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black">
                {confirmConfig.cancelLabel || 'Cancel'}
              </button>
              <button onClick={confirmConfig.onConfirm} className="w-full bg-slate-50 text-slate-500 py-4 rounded-2xl font-black">
                {confirmConfig.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes soft-zoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        .animate-soft-zoom { animation: soft-zoom 20s infinite alternate ease-in-out; }
      `}</style>
    </div>
  );
};

export default App;
