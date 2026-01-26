
import React, { useState } from 'react';
import { Person } from '../types';

interface PersonManagerProps {
  people: Person[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

const PersonManager: React.FC<PersonManagerProps> = ({ people, onAdd, onRemove }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Who's splitting?</h3>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name (e.g. Alex)"
          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {people.map(person => (
          <div key={person.id} className="group relative bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium flex items-center gap-2">
            {person.name}
            <button 
              onClick={() => onRemove(person.id)}
              className="text-indigo-400 hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonManager;
