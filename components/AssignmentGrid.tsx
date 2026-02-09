
import React from 'react';
import { ReceiptData, Person, ItemAssignment } from '../types';

interface AssignmentGridProps {
  receiptData: ReceiptData;
  people: Person[];
  assignments: ItemAssignment[];
  onToggleAssignment: (itemId: string, personId: string) => void;
  onUpdatePortion: (itemId: string, personId: string, delta: number) => void;
}

const AssignmentGrid: React.FC<AssignmentGridProps> = ({ 
  receiptData, 
  people, 
  assignments, 
  onToggleAssignment,
  onUpdatePortion
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {receiptData.items.map((item) => {
          const assignment = assignments.find(a => a.itemId === item.id);
          const totalPortions = (Object.values(assignment?.portions || {}) as number[]).reduce((a, b) => a + b, 0);
          const maxQuantity = item.quantity || 1;
          const isFull = totalPortions >= maxQuantity;

          return (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 leading-tight">
                    {item.name}
                    {item.quantity > 1 && (
                      <span className="ml-2 text-indigo-500 text-xs font-black">
                        x{item.quantity}
                      </span>
                    )}
                  </h4>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">EGP {item.price.toFixed(2)}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-colors ${
                  totalPortions > 0 
                    ? (isFull ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600') 
                    : 'bg-slate-50 text-slate-400'
                }`}>
                  {totalPortions > 0 ? `${totalPortions}/${maxQuantity} share${totalPortions > 1 ? 's' : ''}` : 'unassigned'}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {people.map(person => {
                  const portionCount = assignment?.portions[person.id] || 0;
                  const isAssigned = portionCount > 0;
                  
                  return (
                    <div 
                      key={person.id}
                      className={`flex items-center rounded-xl border transition-all ${
                        isAssigned 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                          : `bg-slate-50 text-slate-500 border-slate-100 ${isFull ? 'opacity-40 cursor-not-allowed' : 'hover:border-indigo-200'}`
                      }`}
                    >
                      {/* Main Toggle Button */}
                      <button
                        onClick={() => onToggleAssignment(item.id, person.id)}
                        disabled={!isAssigned && isFull}
                        className={`px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                          isAssigned ? 'pr-1' : ''
                        }`}
                      >
                        {person.name}
                        {portionCount > 1 && <span className="ml-1 opacity-80">x{portionCount}</span>}
                      </button>

                      {/* Portion Controls (Only visible if assigned) */}
                      {isAssigned && (
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
                            disabled={isFull}
                            className={`p-1.5 hover:bg-white/10 rounded-lg ${isFull ? 'opacity-30 cursor-not-allowed' : ''}`}
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
