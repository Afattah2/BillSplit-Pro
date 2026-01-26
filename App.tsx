
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
      // Initialize assignments
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
    // Also remove from assignments
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
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Analyzing receipt with Gemini AI...</p>
        </div>
      );
    }

    switch (currentStep) {
      case Step.CAPTURE:
        return (
          <div className="space-y-6">
            <CameraCapture onCapture={handleCapture} />
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center">
                {error}
              </div>
            )}
          </div>
        );

      case Step.PEOPLE:
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <PersonManager 
              people={people} 
              onAdd={addPerson} 
              onRemove={removePerson} 
            />
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky bottom-4">
              <button 
                onClick={() => setCurrentStep(Step.CAPTURE)}
                className="text-slate-500 font-semibold hover:text-slate-800"
              >
                Back to Image
              </button>
              <button 
                onClick={() => setCurrentStep(Step.ASSIGN)}
                disabled={people.length === 0}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Next: Split Items
              </button>
            </div>
          </div>
        );

      case Step.ASSIGN:
        return (
          <div className="max-w-4xl mx-auto space-y-6 pb-24">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Assign Items</h2>
                  <p className="text-slate-500 text-sm">Select who pays for what. The cost is split equally.</p>
                </div>
                {capturedImage && (
                  <button 
                    onClick={() => setShowImagePreview(!showImagePreview)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {showImagePreview ? 'Hide Photo' : 'Show Photo'}
                  </button>
                )}
              </div>

              {showImagePreview && capturedImage && (
                <div className="mb-8 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                  <img src={capturedImage} alt="Receipt" className="max-h-96 w-full object-contain bg-slate-100" />
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
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-between items-center max-w-4xl mx-auto z-50">
              <button 
                onClick={() => setCurrentStep(Step.PEOPLE)}
                className="text-slate-500 font-semibold hover:text-slate-800"
              >
                Back to People
              </button>
              <button 
                onClick={() => setCurrentStep(Step.SUMMARY)}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Calculate Totals
              </button>
            </div>
          </div>
        );

      case Step.SUMMARY:
        return (
          <div className="max-w-4xl mx-auto pb-12">
            {receiptData && (
              <Summary 
                receiptData={receiptData}
                people={people}
                assignments={assignments}
              />
            )}
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={() => setCurrentStep(Step.ASSIGN)}
                className="w-full sm:w-auto bg-white border-2 border-indigo-100 text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Back to Edit
              </button>
              <button 
                onClick={() => {
                  setReceiptData(null);
                  setPeople([]);
                  setAssignments([]);
                  setCapturedImage(null);
                  setCurrentStep(Step.CAPTURE);
                }}
                className="w-full sm:w-auto bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors"
              >
                Start New Split
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 py-4 mb-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg cursor-pointer" onClick={() => setCurrentStep(Step.CAPTURE)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">BillSplit Pro</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {renderContent()}
      </main>
      
      <footer className="py-12 text-center text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} BillSplit Pro &bull; AI-Powered Receipt Splitter
      </footer>
    </div>
  );
};

export default App;
