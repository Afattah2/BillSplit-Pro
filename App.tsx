
import React, { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import PersonManager from './components/PersonManager';
import AssignmentGrid from './components/AssignmentGrid';
import Summary from './components/Summary';
import { extractReceiptData } from './services/geminiService';
import { ReceiptData, Person, ItemAssignment } from './types';

enum Step {
  CAPTURE,
  PEOPLE,
  ASSIGN,
  SUMMARY
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.CAPTURE);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [assignments, setAssignments] = useState<ItemAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (base64: string) => {
    setIsLoading(true);
    setError(null);
    setCapturedImage(base64);
    try {
      const data = await extractReceiptData(base64);
      setReceiptData(data);
      setAssignments(data.items.map(item => ({ itemId: item.id, personIds: [] })));
      setCurrentStep(Step.PEOPLE);
    } catch (err) {
      setError("Failed to process receipt. Please try another photo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addPerson = (name: string) => {
    const newPerson = { id: `person-${Date.now()}`, name };
    setPeople([...people, newPerson]);
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    setAssignments(assignments.map(a => ({
      ...a,
      personIds: a.personIds.filter(pid => pid !== id)
    })));
  };

  const toggleAssignment = (itemId: string, personId: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.itemId === itemId) {
        const exists = a.personIds.includes(personId);
        return {
          ...a,
          personIds: exists 
            ? a.personIds.filter(pid => pid !== personId) 
            : [...a.personIds, personId]
        };
      }
      return a;
    }));
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="space-y-1">
            <p className="text-slate-800 font-black text-lg">Processing Bill</p>
            <p className="text-slate-500 text-sm">Gemini AI is reading your items...</p>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case Step.CAPTURE:
        return (
          <div className="space-y-6 pb-12">
            <CameraCapture onCapture={handleCapture} />
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center text-sm font-bold mx-2">
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
              onAdd={addPerson} 
              onRemove={removePerson} 
            />
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-between items-center z-50">
              <button 
                onClick={() => setCurrentStep(Step.CAPTURE)}
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
                  <p className="text-slate-500 text-xs">Cost is split equally between selected people.</p>
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
                onClick={() => setCurrentStep(Step.SUMMARY)}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Finish Split
              </button>
            </div>
          </div>
        );

      case Step.SUMMARY:
        return (
          <div className="max-w-4xl mx-auto pb-12 px-1">
            {receiptData && (
              <Summary 
                receiptData={receiptData}
                people={people}
                assignments={assignments}
              />
            )}
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 px-4">
              <button 
                onClick={() => setCurrentStep(Step.ASSIGN)}
                className="w-full sm:w-auto bg-white border-2 border-slate-100 text-slate-600 px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Assignments
              </button>
              <button 
                onClick={() => {
                  setReceiptData(null);
                  setPeople([]);
                  setAssignments([]);
                  setCapturedImage(null);
                  setCurrentStep(Step.CAPTURE);
                }}
                className="w-full sm:w-auto bg-indigo-50 text-indigo-700 px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-indigo-100 transition-colors"
              >
                New Receipt
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-3 sm:py-4 sticky top-0 z-40 px-safe">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg cursor-pointer active:scale-90 transition-transform" onClick={() => setCurrentStep(Step.CAPTURE)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">BillSplit Pro</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6">
        {renderContent()}
      </main>
      
      <footer className="py-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
        BillSplit Pro &bull; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
