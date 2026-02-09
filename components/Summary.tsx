
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ReceiptData, Person, ItemAssignment } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface SummaryProps {
  receiptData: ReceiptData;
  people: Person[];
  assignments: ItemAssignment[];
}

export interface SummaryHandle {
  sharePDF: () => Promise<void>;
}

const Summary = forwardRef<SummaryHandle, SummaryProps>(({ receiptData, people, assignments }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const totalItemsSubtotal = receiptData.items.reduce((sum, item) => sum + item.price, 0);
  
  // Custom date formatting for DD-MMM-YYYY
  const dateObj = new Date();
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = dateObj.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
  const year = dateObj.getFullYear();
  const today = `${day}-${month}-${year}`;

  const totals = people.map(person => {
    let personalSubtotal = 0;
    const itemBreakdown: { name: string; share: number; portions: number; quantity: number }[] = [];

    receiptData.items.forEach(item => {
      const assignment = assignments.find(a => a.itemId === item.id);
      if (assignment) {
        const personPortions = assignment.portions[person.id] || 0;
        if (personPortions > 0) {
          // Fix: Explicitly cast Object.values to number[] to ensure totalPortions is a number
          const totalPortions = (Object.values(assignment.portions) as number[]).reduce((a, b) => a + b, 0);
          const share = (item.price / totalPortions) * personPortions;
          personalSubtotal += share;
          itemBreakdown.push({ name: item.name, share, portions: personPortions, quantity: item.quantity });
        }
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

  // Fix: Explicitly type the accumulator as number to prevent operator '+' errors on unknown types
  const totalAccounted = totals.reduce((sum: number, t) => sum + t.total, 0);
  const remainingToAssign = Math.max(0, receiptData.total - totalAccounted);
  const isFullyAssigned = remainingToAssign < 0.05;

  const unassignedItems = receiptData.items.filter(item => {
    const assignment = assignments.find(a => a.itemId === item.id);
    // Fix: Cast Object.values to number[] to ensure totalPortions calculation is valid
    const totalPortions = (Object.values(assignment?.portions || {}) as number[]).reduce((a, b) => a + b, 0);
    return totalPortions === 0;
  });

  const handleSharePDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      const element = reportRef.current;
      await document.fonts.ready;

      const canvas = await html2canvas(element, {
        scale: 3, 
        useCORS: true,
        backgroundColor: '#f8fafc',
        logging: false,
        onclone: (clonedDoc) => {
          const container = clonedDoc.querySelector('.summary-container') as HTMLElement;
          if (container) {
            container.style.fontFamily = "'Cairo', sans-serif";
            container.style.direction = 'ltr';
            container.style.textRendering = 'optimizeLegibility';
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 3, canvas.height / 3);
      
      const pdfBlob = pdf.output('blob');
      const fileName = `Split_Bill_${today}.pdf`;

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
        await navigator.share({
          files: [new File([pdfBlob], fileName, { type: 'application/pdf' })],
          title: 'الحساب يجمع - Split Bill Details',
          text: 'Here are the final split details for our bill.'
        });
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF generation failed', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useImperativeHandle(ref, () => ({
    sharePDF: handleSharePDF
  }));

  return (
    <div ref={reportRef} className="summary-container space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 overflow-visible" style={{ direction: 'ltr' }}>
      {/* Report Header */}
      <div className="text-center space-y-3 px-4 overflow-visible pt-8">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-[1.25rem] shadow-xl shadow-indigo-100 ring-8 ring-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tight block py-1 leading-tight arabic-shaping">
            الحساب يجمع
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-700 block py-1 leading-tight">
            Final Split
          </h3>
          <p className="text-slate-400 text-sm font-black uppercase tracking-[0.2em] pt-2">{today}</p>
        </div>
      </div>
      
      {/* Individual Breakdown Cards */}
      <div className="space-y-8 px-1 overflow-visible">
        {totals.map(({ person, subtotal, tax, serviceCharge, total, items }) => (
          <div key={person.id} className="bg-white p-7 sm:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col transition-all active:scale-[0.99] overflow-visible min-h-fit">
            
            <div className="flex justify-between items-center mb-8 pb-8 border-b-2 border-slate-50 overflow-visible gap-4">
              <h4 className="text-2xl sm:text-3xl font-black text-indigo-600 break-words leading-tight">
                {person.name}
              </h4>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums leading-tight shrink-0 font-mono">
                EGP {total.toFixed(2)}
              </div>
            </div>

            <div className="flex-1 space-y-5 mb-10 overflow-visible">
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start overflow-visible border-b border-slate-50/50 last:border-0 pb-2 last:pb-0 gap-4">
                    <span className="text-base sm:text-lg text-slate-500 font-bold break-words leading-relaxed">
                      {item.name} 
                      {item.quantity > 1 && <span className="text-xs text-slate-400 ml-1 italic"> (total x{item.quantity})</span>}
                      {item.portions > 1 && <span className="text-xs text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full align-middle ml-2">x{item.portions} shared</span>}
                    </span>
                    <span className="text-base sm:text-lg font-mono tabular-nums font-black text-slate-800 shrink-0">
                      EGP {item.share.toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-300 text-sm italic py-8 text-center bg-slate-50/50 rounded-2xl">
                  No items assigned
                </div>
              )}
            </div>

            <div className="space-y-3 pt-8 border-t-2 border-slate-50 text-xs sm:text-sm text-indigo-400/80 uppercase tracking-[0.1em] font-black overflow-visible">
              <div className="flex justify-between items-center">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums text-slate-400 font-bold">EGP {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>+ Proportional Tax:</span>
                <span className="font-mono tabular-nums font-black text-indigo-500/60">EGP {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>+ Service Charge:</span>
                <span className="font-mono tabular-nums font-black text-indigo-500/60">EGP {serviceCharge.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}

        {!isFullyAssigned && (
          <div className="bg-amber-50/30 p-8 sm:p-10 rounded-[3rem] border-4 border-dashed border-amber-100 flex flex-col shadow-inner overflow-visible">
            <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-amber-100">
              <h4 className="text-2xl font-black text-amber-600 leading-tight">Remaining</h4>
              <div className="text-2xl font-black text-amber-700 tabular-nums leading-tight font-mono">
                EGP {remainingToAssign.toFixed(2)}
              </div>
            </div>
            <div className="space-y-4 overflow-visible">
              <p className="text-xs font-black text-amber-600/70 uppercase tracking-[0.2em] mb-4">Unassigned items:</p>
              {unassignedItems.map(item => (
                <div key={item.id} className="flex justify-between items-start gap-4 text-sm sm:text-base text-amber-800 font-bold overflow-visible">
                  <span className="break-words leading-relaxed">{item.name} {item.quantity > 1 && <span className="text-xs opacity-60">(x{item.quantity})</span>}</span>
                  <span className="font-mono shrink-0 font-black">EGP {item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={`p-10 sm:p-16 rounded-[4rem] mt-16 text-center shadow-3xl transition-all duration-1000 overflow-visible ${isFullyAssigned ? 'bg-[#0f172a] text-white' : 'bg-white border-4 border-slate-100 text-black'}`}>
        <div className={`uppercase text-[12px] font-black tracking-[0.4em] mb-6 ${isFullyAssigned ? 'text-indigo-400' : 'text-slate-400'}`}>
          {isFullyAssigned ? 'Split Successful' : 'Progress'}
        </div>
        <div className={`text-6xl sm:text-8xl font-black tabular-nums tracking-tighter leading-none mb-10 py-4 font-mono ${!isFullyAssigned && 'text-indigo-600'}`}>
          EGP {totalAccounted.toFixed(2)}
        </div>
        
        <div className="max-w-md mx-auto space-y-10 overflow-visible">
          <div className="w-full bg-slate-400/10 h-4 rounded-full overflow-hidden p-1 border border-white/5">
            <div 
              className={`h-full rounded-full transition-all duration-[2000ms] ease-out shadow-lg ${isFullyAssigned ? 'bg-indigo-400' : 'bg-indigo-600'}`}
              style={{ width: `${Math.min(100, (totalAccounted / receiptData.total) * 100)}%` }}
            />
          </div>
          
          <div className="flex flex-col gap-4 overflow-visible pb-10">
             <div className="flex items-center justify-center gap-4 text-lg font-black">
              <span className={`${isFullyAssigned ? 'text-slate-400' : 'text-slate-500'}`}>Grand Total:</span>
              <span className={`font-mono text-2xl ${isFullyAssigned ? 'text-white' : 'text-black'}`}>EGP {receiptData.total.toFixed(2)}</span>
            </div>

            {!isFullyAssigned && (
              <div className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-amber-100 text-amber-700 rounded-3xl text-xs font-black uppercase tracking-[0.1em] animate-pulse border-2 border-amber-200 mt-4 self-center shadow-xl shadow-amber-900/5">
                Remaining: EGP {remainingToAssign.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

Summary.displayName = 'Summary';

export default Summary;
