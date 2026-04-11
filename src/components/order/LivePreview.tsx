import { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LivePreviewProps {
  text: string;
  colunas?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

function LogoRenderer({ dataJson, url }: { dataJson?: string, url?: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(240);

  useEffect(() => {
    if (url) {
      setDataUrl(url);
      setImgWidth(240); // Standard width for logos
      return;
    }

    if (!dataJson) return;

    try {
      const { width, height, data } = JSON.parse(dataJson);
      setImgWidth(width);
      const binary = atob(data);
      const uint8 = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) uint8[i] = binary.charCodeAt(i);
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const imageData = ctx.createImageData(width, height);
      const pixels = imageData.data;
      
      for (let i = 0; i < uint8.length; i++) {
        const val = uint8[i];
        const offset = i * 4;
        const color = val ? 0 : 255;
        pixels[offset] = color;
        pixels[offset + 1] = color;
        pixels[offset + 2] = color;
        pixels[offset + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      setDataUrl(canvas.toDataURL());
    } catch (e) {
      console.error('Erro ao renderizar logo no preview:', e);
    }
  }, [dataJson, url]);

  if (!dataUrl) return null;
  const printWidthDots = 384; 
  const widthPercentage = Math.min((imgWidth / printWidthDots) * 100, 100);
  
  return <img src={dataUrl} alt="Logo" className="mx-auto mb-4 block opacity-90" style={{ width: `${widthPercentage}%`, height: 'auto' }} />;
}

export function LivePreview({ text, colunas, isOpen, onClose }: LivePreviewProps) {
  const PreviewContent = () => {
    if (!text) return (
      <div className="receipt-container min-w-[260px]">
        <div className="receipt-text mx-auto flex flex-col font-mono" style={{ width: `${colunas || 32}ch` }}>O cupom está vazio.{"\n"}Adicione itens para visualizar.</div>
      </div>
    );

    const lines = text.split('\n');

    return (
      <div className="receipt-container">
        <div className="receipt-text mx-auto flex flex-col font-mono" style={{ width: `${colunas || 32}ch` }}>
          {lines.map((line, i) => {
            if (line.includes('[IMG:')) {
              const imgMatches = line.match(/\[IMG:(.*?)\]/);
              if (imgMatches) {
                return <LogoRenderer key={i} dataJson={imgMatches[1]} />;
              }
            }

            if (line.includes('[IMG_URL:')) {
              const imgUrlMatches = line.match(/\[IMG_URL:(.*?)\]/);
              if (imgUrlMatches) {
                return <LogoRenderer key={i} url={imgUrlMatches[1]} />;
              }
            }

            const alignMatch = line.match(/\[ALIGN:(.*?)\](.*?)\[\/ALIGN\]/);
            if (alignMatch) {
              const mode = alignMatch[1];
              const content = alignMatch[2];
              return (
                <div 
                  key={i} 
                  className={`w-full whitespace-pre ${mode === 'center' ? 'text-center' : mode === 'right' ? 'text-right' : ''}`}
                >
                  {content || '\u00A0'}
                </div>
              );
            }

            return <div key={i} className="min-h-[1em] whitespace-pre w-full text-left font-mono">{line || '\u00A0'}</div>;
          })}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-8">
          {/* Backdrop Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020305]/95 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg glass-panel overflow-hidden border-white/[0.05] shadow-[0_40px_100px_rgba(0,0,0,0.8)] max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Eye size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Preview do Cupom</h3>
                  <p className="text-[10px] font-semibold text-text-dim uppercase tracking-widest">Visualização Digital</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Receipt Area */}
            <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-black/40 custom-scrollbar">
              <motion.div 
                initial={{ rotateX: 10, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="perspective-1000"
              >
                <PreviewContent />
              </motion.div>
            </div>

            {/* Footer / Hint */}
            <div className="p-6 border-t border-white/[0.05] bg-white/[0.01] text-center">
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">
                Isso é uma representação do cupom impresso
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
