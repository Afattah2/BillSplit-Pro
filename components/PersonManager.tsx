
import React, { useState } from 'react';
import { Person } from '../types';

interface PersonManagerProps {
  people: Person[];
  placeName: string;
  setPlaceName: (name: string) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

const PersonManager: React.FC<PersonManagerProps> = ({ people, placeName, setPlaceName, onAdd, onRemove }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          Where are you?
        </h3>
        <input 
          type="text" 
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          placeholder="Restaurant / Cafe name"
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-lg text-slate-900 placeholder:text-slate-300"
        />
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.005 3.005 0 013.75-2.906z" />
            </svg>
          </div>
          Who's splitting?
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-[80fr_20fr] gap-3 mb-6">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add person name..."
            className="min-w-0 w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300"
          />
          <button 
            type="submit"
            className="px-4 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100"
          >
            Add
          </button>
        </form>

        <div className="flex flex-wrap gap-2.5">
          {people.length === 0 ? (
            <div className="w-full py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-sm">No one added yet</p>
            </div>
          ) : (
            people.map(person => (
              <div key={person.id} className="group animate-in zoom-in-95 duration-200 bg-indigo-50 text-indigo-700 pl-5 pr-3 py-2.5 rounded-2xl font-black text-sm flex items-center gap-3 border border-indigo-100">
                {person.name}
                <button 
                  onClick={() => onRemove(person.id)}
                  className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonManager;
