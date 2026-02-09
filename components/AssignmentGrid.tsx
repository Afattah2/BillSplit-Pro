import React from 'react';
import { ReceiptData, Person, ItemAssignment } from '../types';

interface AssignmentGridProps {
  receiptData: ReceiptData;
  people: Person[];
  assignments: ItemAssignment[];
  onToggleAssignment: (itemId: string, personId: string) => void;
}

const AssignmentGrid: React.FC<AssignmentGridProps> = ({ 
  receiptData, 
  people, 
  assignments, 
  onToggleAssignment 
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {receiptData.items.map((item) => {
          const assignment = assignments.find(a => a.itemId === item.id);
          const assignedCount = assignment?.personIds.length || 0;

          return (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 leading-tight">{item.name}</h4>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">EGP {item.price.toFixed(2)}</div>
                </div>
                <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  {assignedCount > 0 ? `${assignedCount} split` : 'unassigned'}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {people.map(person => {
                  const isAssigned = assignment?.personIds.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      onClick={() => onToggleAssignment(item.id, person.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                        isAssigned 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100' 
                          : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-indigo-200'
                      }`}
                    >
                      {person.name}
                    </button>
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