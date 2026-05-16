import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import {
  Download,
  ArrowLeft,
  Loader2,
  ShieldCheck
} from 'lucide-react';

import { toast } from 'react-toastify';

const PDFViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure layout plugin to hide download/print in preview mode
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            CurrentPageInput,
            GoToNextPage,
            GoToPreviousPage,
            NumberOfPages,
            ShowSearchPopover,
            Zoom,
            ZoomIn,
            ZoomOut,
            EnterFullScreen,
            SwitchTheme,
            Download,
            Print,
            Open
          } = slots;
          return (
            <div className="flex items-center justify-between w-full px-4">
              <div className="flex items-center gap-1 md:gap-2">
                <ShowSearchPopover />
                <ZoomOut />
                <Zoom />
                <ZoomIn />
                <SwitchTheme />
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <GoToPreviousPage />
                <div className="flex items-center gap-1">
                  <CurrentPageInput />
                  <span className="text-white/20">/</span>
                  <NumberOfPages />
                </div>
                <GoToNextPage />
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <EnterFullScreen />
                {!isPreview && (
                  <>
                    <Download />
                    <Print />
                  </>
                )}
                {/* Always hide 'Open file' button */}
              </div>
            </div>
          );
        }}
      </Toolbar>
    ),
  });

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await api.get(`/api/materials/${id}`);
        setMaterial(res.data);
      } catch (err) {
        toast.error('Failed to load PDF');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-white/40" size={40} />
        <p className="text-white/40 font-medium">Decrypting your material...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#111]">
      {/* Header */}
      <div className="glass-dark px-6 py-4 flex justify-between items-center z-10 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-sm md:text-base">{material?.title}</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">
              {material?.subject} • {isPreview ? 'Preview Mode' : 'Secured Access'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPreview ? (
            <button 
              onClick={() => navigate(`/materials/${material?.type || 'Notes'}?buy=${id}`)}
              className="flex items-center gap-2 px-6 py-2 md:py-2.5 bg-white text-black rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl hover:bg-gray-200 transition-all active:scale-95"
            >
              Buy Now
            </button>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-500 text-[10px] font-bold">
                <ShieldCheck size={14} /> SECURE VIEW
              </div>
              <button
                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/api/materials/download/${id}${localStorage.getItem('userToken') ? `?token=${localStorage.getItem('userToken')}` : ''}`, '_blank')}
                className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Download</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden bg-[#1a1a1a] relative">
        {isPreview && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 w-[90%] md:w-auto justify-between md:justify-start">
            <p className="text-[8px] md:text-[10px] font-bold text-white/60 leading-tight">Purchase material for full access & download</p>
            <button 
              onClick={() => navigate(`/materials/${material?.type || 'Notes'}?buy=${id}`)}
              className="bg-white text-black text-[8px] md:text-[10px] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg uppercase whitespace-nowrap active:scale-95 transition-all"
            >
              Buy Now
            </button>
          </div>
        )}
        
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <div className="h-full">
            {material && (
              <Viewer
                fileUrl={material.pdfPath}
                plugins={[defaultLayoutPluginInstance]}
                theme="dark"
              />
            )}
          </div>
        </Worker>
      </div>
    </div>
  );
};

export default PDFViewer;