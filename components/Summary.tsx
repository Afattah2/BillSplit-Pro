
import React from 'react';
import { ReceiptData, Person, ItemAssignment } from '../types';

interface SummaryProps {
  receiptData: ReceiptData;
  people: Person[];
  assignments: ItemAssignment[];
}

const Summary: React.FC<SummaryProps> = ({ receiptData, people, assignments }) => {
  const totalItemsSubtotal = receiptData.items.reduce((sum, item) => sum + item.price, 0);

  const totals = people.map(person => {
    let personalSubtotal = 0;
    const itemBreakdown: { name: string; share: number }[] = [];

    receiptData.items.forEach(item => {
      const assignment = assignments.find(a => a.itemId === item.id);
      if (assignment?.personIds.includes(person.id)) {
        const share = item.price / assignment.personIds.length;
        personalSubtotal += share;
        itemBreakdown.push({ name: item.name, share });
      }
    });

    const proportion = totalItemsSubtotal > 0 ? personalSubtotal / totalItemsSubtotal : 0;
    const personalTax = receiptData.tax * proportion;
    const personalService = receiptData.serviceCharge * proportion;
    const grandTotal = personalSubtotal + personalTax + personalService;

    return {
      person,
      subtotal: personalSubtotal,
      tax: personalTax,
      serviceCharge: personalService,
      total: grandTotal,
      items: itemBreakdown
    };
  });

  const totalAccounted = totals.reduce((sum, t) => sum + t.total, 0);
  const remainingToAssign = Math.max(0, receiptData.total - totalAccounted);
  const isFullyAssigned = remainingToAssign < 0.05;

  const unassignedItems = receiptData.items.filter(item => {
    const assignment = assignments.find(a => a.itemId === item.id);
    return !assignment || assignment.personIds.length === 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-6 sm:mb-8 px-4">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">Final Split</h3>
        <p className="text-slate-500 text-sm mt-1">Breakdown of assigned costs and taxes</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-1">
        {totals.map(({ person, subtotal, tax, serviceCharge, total, items }) => (
          <div key={person.id} className="bg-white p-5 sm:p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col transition-transform active:scale-[0.99]">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-50">
              <h4 className="text-lg sm:text-xl font-bold text-indigo-600 truncate mr-2">{person.name}</h4>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                ${total.toFixed(2)}
              </div>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs sm:text-sm text-slate-600">
                    <span className="truncate max-w-[140px] sm:max-w-[180px]">{item.name}</span>
                    <span className="font-mono tabular-nums font-medium">${item.share.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs italic py-2">No items assigned</div>
              )}
            </div>

            <div className="space-y-1 pt-4 border-t border-slate-50 text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-black">
              <div className="flex justify-between">
                <span>Net Subtotal:</span>
                <span className="font-mono tabular-nums text-slate-600">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-indigo-400/80">
                <span>+ Prop. Tax:</span>
                <span className="font-mono tabular-nums">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-indigo-400/80">
                <span>+ Prop. Service:</span>
                <span className="font-mono tabular-nums">${serviceCharge.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}

        {!isFullyAssigned && (
          <div className="bg-amber-50/50 p-5 sm:p-6 rounded-3xl border-2 border-dashed border-amber-200 flex flex-col">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-amber-100">
              <h4 className="text-lg sm:text-xl font-bold text-amber-600">Unassigned</h4>
              <div className="text-xl sm:text-2xl font-black text-amber-700 tabular-nums">
                ${remainingToAssign.toFixed(2)}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mb-2">Pending items:</p>
              {unassignedItems.map(item => (
                <div key={item.id} className="flex justify-between text-[11px] sm:text-xs text-amber-800">
                  <span className="truncate">{item.name}</span>
                  <span className="font-mono font-medium">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={`p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] mt-8 sm:mt-12 text-center shadow-xl sm:shadow-2xl transition-all duration-500 ${isFullyAssigned ? 'bg-slate-900 text-white shadow-indigo-200' : 'bg-white border-2 border-slate-100 text-slate-900'}`}>
        <div className={`uppercase text-[10px] font-black tracking-[0.3em] mb-2 sm:mb-3 ${isFullyAssigned ? 'text-indigo-400' : 'text-slate-400'}`}>
          {isFullyAssigned ? 'Split Completed' : 'Total Assigned'}
        </div>
        <div className={`text-4xl sm:text-6xl font-black tabular-nums tracking-tighter ${!isFullyAssigned && 'text-indigo-600'}`}>
          ${totalAccounted.toFixed(2)}
        </div>
        
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="w-full max-w-xs bg-slate-100/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, (totalAccounted / receiptData.total) * 100)}%` }}
            />
          </div>
          
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <span className={isFullyAssigned ? 'text-slate-400' : 'text-slate-500'}>Target:</span>
            <span className={`font-mono font-bold ${isFullyAssigned ? 'text-white' : 'text-slate-900'}`}>${receiptData.total.toFixed(2)}</span>
          </div>

          {!isFullyAssigned && (
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold animate-pulse uppercase tracking-wider">
              ${remainingToAssign.toFixed(2)} remaining
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;
