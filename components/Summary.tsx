
import React from 'react';
import { ReceiptData, Person, ItemAssignment } from '../types';

interface SummaryProps {
  receiptData: ReceiptData;
  people: Person[];
  assignments: ItemAssignment[];
}

const Summary: React.FC<SummaryProps> = ({ receiptData, people, assignments }) => {
  const calculateTotalSubtotal = () => {
    return receiptData.items.reduce((sum, item) => sum + item.price, 0);
  };

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

    const totalSubtotal = calculateTotalSubtotal();
    const ratio = totalSubtotal > 0 ? personalSubtotal / totalSubtotal : 0;
    const personalTax = receiptData.tax * ratio;
    const personalService = receiptData.serviceCharge * ratio;
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-2xl font-black text-slate-900 text-center mb-8">Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {totals.map(({ person, subtotal, tax, serviceCharge, total, items }) => (
          <div key={person.id} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-50">
              <h4 className="text-xl font-bold text-indigo-600">{person.name}</h4>
              <div className="text-2xl font-black text-slate-900">${total.toFixed(2)}</div>
            </div>

            <div className="space-y-3 mb-6">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm text-slate-600">
                  <span className="truncate max-w-[200px]">{item.name}</span>
                  <span className="font-mono">${item.share.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-4 border-t border-slate-50 text-xs text-slate-400 uppercase tracking-wider font-bold">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Svc Charge:</span>
                <span className="font-mono">${serviceCharge.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl mt-12 text-center">
        <div className="text-slate-400 uppercase text-xs font-black tracking-widest mb-2">Grand Total Accounted</div>
        <div className="text-5xl font-black">
          ${totals.reduce((sum, t) => sum + t.total, 0).toFixed(2)}
        </div>
        <p className="mt-4 text-slate-400 text-sm">Should match the receipt total of ${receiptData.total.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default Summary;
