'use client'

import React, { useState, useEffect } from 'react';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const pages = [
    { name: 'Food Journal', path: '/food-journal', description: 'Track your daily food intake and nutrition' },
    { name: 'Radical Results', path: '/radical-results', description: 'A team wide approach to radical candor.' },
    // Add other pages here as they become available
  ];

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  return (
    <div className="p-8 bg-slate-900 w-full min-h-screen mx-auto">
      <div className="max-w-7xl mx-auto">
        <div className="font-mono p-4 text-slate-300 rounded-md">
          <div className="flex items-center mb-4">
            <span className="mr-2">┌── </span>
            <span className="text-slate-100 font-bold text-xl">ejcx.dev</span>
          </div>

          <div className="pl-6 border-l border-slate-700">
            {/* Terminal-style search input */}
            <div className="flex items-center mb-4 relative">
              <span className="text-green-500 mr-2">$</span>
              <div className="flex">
                <span>{searchQuery}</span>
                <span className={`w-2 h-5 bg-slate-300 ml-0.5 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}></span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="opacity-0 absolute w-full h-full left-0 top-0 cursor-text"
                autoFocus
              />
            </div>

            {filteredPages.length > 0 ? (
              filteredPages.map((page, index) => (
                <div key={index} className="mb-2">
                  <div className="flex items-center">
                    <span className="mr-2">{index === filteredPages.length - 1 ? '└── ' : '├── '}</span>
                    <a
                      href={page.path}
                      className="hover:text-white cursor-pointer transition-colors font-medium"
                    >
                      {page.name}
                    </a>
                    <span className="ml-3 text-slate-500">{`// ${page.description}`}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-500">No apps found matching your search</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;