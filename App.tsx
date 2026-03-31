import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initialData, ProgramData, Performer } from './types';
import { ProgramPreview } from './ProgramPreview';
import { exportToWord } from './exportToWord';
import { Plus, Trash2, Download, Printer, Image as ImageIcon, FileText, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<ProgramData>(() => {
    const saved = localStorage.getItem('program-generator-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    return initialData;
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('program-generator-data', JSON.stringify(data));
  }, [data]);

  const handleReset = () => {
    setData(initialData);
    setShowResetConfirm(false);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'logo') {
          setData({ ...data, [field]: reader.result as string, logoPosition: { x: 0, y: 0 } });
        } else {
          setData({ ...data, [field]: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addPerformer = () => {
    setData({
      ...data,
      performers: [...data.performers, { id: uuidv4(), name: '', piece: '' }],
    });
  };

  const removePerformer = (id: string) => {
    setData({
      ...data,
      performers: data.performers.filter((p) => p.id !== id),
    });
  };

  const updatePerformer = (id: string, field: keyof Performer, value: string) => {
    setData({
      ...data,
      performers: data.performers.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    });
  };

  const movePerformer = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === data.performers.length - 1)
    ) {
      return;
    }

    const newPerformers = [...data.performers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newPerformers[index];
    newPerformers[index] = newPerformers[targetIndex];
    newPerformers[targetIndex] = temp;

    setData({ ...data, performers: newPerformers });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans print:overflow-visible print:bg-white print:h-auto">
      {/* Sidebar Controls */}
      <div className="w-1/3 min-w-[350px] max-w-[450px] bg-white border-r border-gray-200 overflow-y-auto flex flex-col shadow-lg z-10 print:hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 sticky top-0 z-20">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Program Generator
              </h1>
              <p className="text-sm text-gray-500 mt-1">Create beautiful landscape recital programs.</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowResetConfirm(!showResetConfirm)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Reset all data"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              {showResetConfirm && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 p-3 z-50">
                  <p className="text-sm text-gray-700 font-medium mb-3">Erase all progress?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                    >
                      Erase
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Event Details */}
          <section>
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-700">Event Details</h2>
              {(data.headerPosition?.x !== 0 || data.headerPosition?.y !== 0) && (
                <button 
                  onClick={() => setData({ ...data, headerPosition: { x: 0, y: 0 } })} 
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Reset Position
                </button>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={data.subtitle}
                  onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={data.date}
                    onChange={(e) => setData({ ...data, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={data.time}
                    onChange={(e) => setData({ ...data, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => setData({ ...data, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Branding & Design */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Branding & Design</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                  <select
                    value={data.fontFamily}
                    onChange={(e) => setData({ ...data, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="serif">Serif (Classic)</option>
                    <option value="sans-serif">Sans-Serif (Modern)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
                  <select
                    value={data.layout}
                    onChange={(e) => setData({ ...data, layout: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1-column">1 Column (Full Page)</option>
                    <option value="folded">Folded (Internal 2-Column)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.themeColor}
                      onChange={(e) => setData({ ...data, themeColor: e.target.value })}
                      className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">{data.themeColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Size ({Math.round((data.fontSizeScale || 1) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={data.fontSizeScale || 1}
                    onChange={(e) => setData({ ...data, fontSizeScale: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name Column Width ({data.nameColumnWidth || 40}%)
                </label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="1"
                  value={data.nameColumnWidth || 40}
                  onChange={(e) => setData({ ...data, nameColumnWidth: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3"
                />
                <p className="text-xs text-gray-500 mt-1">Adjust this if long names are squishing the song titles.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Header Spacing ({data.headerSpacing ?? 1.5}em)
                </label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.25"
                  value={data.headerSpacing ?? 1.5}
                  onChange={(e) => setData({ ...data, headerSpacing: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3"
                />
                <p className="text-xs text-gray-500 mt-1">Adjust the space between the event details and the performers.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title Size ({Math.round((data.titleFontSizeScale ?? 1) * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={data.titleFontSizeScale ?? 1}
                  onChange={(e) => setData({ ...data, titleFontSizeScale: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3"
                />
                <p className="text-xs text-gray-500 mt-1">Adjust the size of the main event title.</p>
              </div>

              {/* Image Uploads */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Upload Logo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                    </label>
                    {data.logo && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setData({ ...data, logoPosition: { x: 0, y: 0 } })} className="text-sm text-blue-600 hover:text-blue-800">Reset Pos</button>
                        <button onClick={() => setData({ ...data, logo: null })} className="text-sm text-red-600 hover:text-red-800">Remove</button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Graphic</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Upload Background
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'background')} />
                    </label>
                    {data.background && (
                      <button onClick={() => setData({ ...data, background: null })} className="text-sm text-red-600 hover:text-red-800">Remove</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Performers */}
          <section>
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-700">Performers ({data.performers.length})</h2>
              <button
                onClick={addPerformer}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </button>
            </div>

            <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Names in First Column: {data.firstColumnLimit !== undefined ? data.firstColumnLimit : 'Auto'}
                </label>
                {data.firstColumnLimit !== undefined && (
                  <button 
                    onClick={() => setData({ ...data, firstColumnLimit: undefined })}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Reset to Auto
                  </button>
                )}
              </div>
              <input
                type="range"
                min="1"
                max={Math.max(20, data.performers.length)}
                step="1"
                value={data.firstColumnLimit !== undefined ? data.firstColumnLimit : (data.logo ? 10 : 12)}
                onChange={(e) => setData({ ...data, firstColumnLimit: parseInt(e.target.value) })}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                Adjust how many performers appear in the left column before spilling over to the right.
              </p>
            </div>

            <div className="space-y-3">
              {data.performers.map((performer, index) => (
                <div key={performer.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => movePerformer(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => movePerformer(index, 'down')}
                      disabled={index === data.performers.length - 1}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Student Name"
                      value={performer.name}
                      onChange={(e) => updatePerformer(performer.id, 'name', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Piece Title (e.g., Sonata in C - Mozart)"
                      value={performer.piece}
                      onChange={(e) => updatePerformer(performer.id, 'piece', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => removePerformer(performer.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors self-center"
                    title="Remove performer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {data.performers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No performers added yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col bg-gray-200 overflow-hidden relative print:bg-white print:overflow-visible">
        {/* Top Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10 print:hidden">
          <div className="text-sm text-gray-500 font-medium">
            Preview: Letter Size (11" x 8.5" Landscape)
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportToWord(data)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Word
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center print:p-0 print:overflow-visible print:block">
          {/* Scale wrapper to fit the 11x8.5 inch preview on smaller screens */}
          <div className="transform origin-center scale-[0.6] md:scale-[0.7] lg:scale-[0.8] xl:scale-100 transition-transform duration-300 print:transform-none print:scale-100">
            <ProgramPreview 
              data={data} 
              ref={componentRef} 
              onUpdateLogoPosition={(pos) => setData({ ...data, logoPosition: pos })}
              onUpdateHeaderPosition={(pos) => setData({ ...data, headerPosition: pos })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
