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

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

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

        <Loader2
          className="animate-spin text-white/40"
          size={40}
        />

        <p className="text-white/40 font-medium">
          Decrypting your material...
        </p>

      </div>
    );
  }

  return (

    <div className="h-screen flex flex-col bg-[#111]">

      {/* Header */}
      <div className="glass-dark px-6 py-4 flex justify-between items-center z-10 border-b border-white/10">

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <ArrowLeft size={20} />
          </button>

          <div>

            <h1 className="font-bold text-sm md:text-base">
              {material?.title}
            </h1>

            <p className="text-[10px] text-white/40 uppercase tracking-widest">
              {material?.subject} • Secured Access
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-500 text-[10px] font-bold">

            <ShieldCheck size={14} />

            SECURE VIEW

          </div>

          <a
            href={`${import.meta.env.VITE_API_URL}/api/materials/download/${id}?token=${localStorage.getItem('userToken')}`}
            className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all"
          >

            <Download size={18} />

            <span className="hidden sm:inline">
              Download
            </span>

          </a>

        </div>

      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden bg-[#1a1a1a]">

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