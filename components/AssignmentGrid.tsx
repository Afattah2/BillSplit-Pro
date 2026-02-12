import React from 'react';
import { ReceiptData, Person, ItemAssignment } from '../types';

interface AssignmentGridProps {
  receiptData: ReceiptData;
  people: Person[];
  assignments: ItemAssignment[];
  onToggleAssignment: (itemId: string, personId: string) => void;
  onUpdatePortion: (itemId: string, personId: string, delta: number) => void;
  onToggleFreeSplit: (itemId: string) => void;
  highlightUnassigned?: boolean;
}

const AssignmentGrid: React.FC<AssignmentGridProps> = ({ 
  receiptData, 
  people, 
  assignments, 
  onToggleAssignment,
  onUpdatePortion,
  onToggleFreeSplit,
  highlightUnassigned = false
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {receiptData.items.map((item) => {
          const assignment = assignments.find(a => a.itemId === item.id);
          const isFreeSplit = assignment?.isFreeSplit || false;
          const totalPortions = (Object.values(assignment?.portions || {}) as number[]).reduce((a, b) => a + b, 0);
          
          // Logic for badge status
          let isFullyAssigned = false;
          if (isFreeSplit) {
            isFullyAssigned = totalPortions > 0;
          } else {
            isFullyAssigned = totalPortions >= item.quantity;
          }

          const isPartiallyAssigned = !isFreeSplit && totalPortions > 0 && totalPortions < item.quantity;
          const isUnassigned = totalPortions === 0;
          
          let badgeClass = 'bg-slate-50 text-slate-400';
          let containerClass = 'border-slate-100';

          if (isFullyAssigned) {
            badgeClass = 'bg-green-50 text-green-600 border border-green-100';
            containerClass = 'border-green-100 bg-green-50/5';
          } else if (highlightUnassigned) {
            badgeClass = 'bg-red-50 text-red-600 border border-red-100 animate-pulse';
            containerClass = 'border-red-100 bg-red-50/10';
          } else if (isPartiallyAssigned) {
            badgeClass = 'bg-indigo-50 text-indigo-600';
          }

          return (
            <div key={item.id} className={`bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all ${containerClass}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 leading-tight">
                      {item.name}
                      {item.quantity > 1 && !isFreeSplit && (
                        <span className="ml-2 text-indigo-500 text-xs font-black">
                          x{item.quantity}
                        </span>
                      )}
                    </h4>
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={isFreeSplit}
                          onChange={() => onToggleFreeSplit(item.id)}
                          className="peer appearance-none w-4 h-4 rounded border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all"
                        />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-indigo-600 transition-colors">Free Split</span>
                    </label>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">EGP {item.price.toFixed(2)}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-colors ${badgeClass}`}>
                  {isFreeSplit 
                    ? (isFullyAssigned ? 'Equal Split' : 'Select People')
                    : `${totalPortions} / ${item.quantity} portions`
                  }
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {people.map(person => {
                  const portionsCount = assignment?.portions[person.id] || 0;
                  const isAssigned = portionsCount > 0;
                  
                  return (
                    <div 
                      key={person.id}
                      className={`flex items-center rounded-xl border transition-all ${
                        isAssigned 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                          : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-indigo-200'
                      }`}
                    >
                      {/* Main Toggle Button */}
                      <button
                        onClick={() => onToggleAssignment(item.id, person.id)}
                        disabled={!isFreeSplit && !isAssigned && isFullyAssigned}
                        className={`px-3 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isAssigned && !isFreeSplit ? 'pr-1' : ''
                        }`}
                      >
                        {person.name}
                        {portionsCount > 1 && !isFreeSplit && <span className="ml-1 opacity-80">x{portionsCount}</span>}
                      </button>

                      {/* Portion Controls (Hidden in Free Split) */}
                      {isAssigned && !isFreeSplit && (
                        <div className="flex items-center pr-1 border-l border-white/20 ml-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdatePortion(item.id, person.id, -1);
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                            </svg>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdatePortion(item.id, person.id, 1);
                            }}
                            disabled={isFullyAssigned}
                            className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50 space-y-3">
        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Taxes & Fees</span>
          <span className="font-mono text-indigo-600">EGP {(receiptData.tax + receiptData.serviceCharge).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-indigo-100">
          <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Receipt Total</span>
          <span className="text-2xl font-black text-indigo-700 font-mono">EGP {receiptData.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default AssignmentGrid;