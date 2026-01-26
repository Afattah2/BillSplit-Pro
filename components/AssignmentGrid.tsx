
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
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 font-semibold text-slate-700">Item</th>
                <th className="p-4 font-semibold text-slate-700 text-right">Price</th>
                <th className="p-4 font-semibold text-slate-700">Split With</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receiptData.items.map((item) => {
                const assignment = assignments.find(a => a.itemId === item.id);
                const assignedCount = assignment?.personIds.length || 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{item.name}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-mono text-slate-600">${item.price.toFixed(2)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {people.map(person => {
                          const isAssigned = assignment?.personIds.includes(person.id);
                          return (
                            <button
                              key={person.id}
                              onClick={() => onToggleAssignment(item.id, person.id)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                isAssigned 
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                  : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-500'
                              }`}
                            >
                              {person.name}
                            </button>
                          );
                        })}
                      </div>
                      {assignedCount === 0 && (
                        <span className="text-xs text-amber-500 mt-1 block">No one assigned yet</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-indigo-50 p-4 rounded-xl space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Total Tax:</span>
          <span className="font-mono font-bold">${receiptData.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Total Service Charge:</span>
          <span className="font-mono font-bold">${receiptData.serviceCharge.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-indigo-100">
          <span>Receipt Total:</span>
          <span className="font-mono">${receiptData.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default AssignmentGrid;
