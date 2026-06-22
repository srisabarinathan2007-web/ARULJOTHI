import React, { useState, useRef, useCallback } from 'react';
import { 
  Printer, Upload, X, User, Image as ImageIcon, Layout, Move, 
  CheckCircle2, RefreshCw, Scan, RotateCw, Wand2, Scissors,
  ChevronRight, Bell, ChevronDown, Eye, FileText, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { format } from 'date-fns';

// Helper function to get cropped image
const getCroppedImg = async (imageSrc: string, pixelCrop: any, rotation = 0): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rotRad = (rotation * Math.PI) / 180;
  
  // Set canvas size to the final crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  
  // Step 1: Move to the center of the canvas
  ctx.translate(canvas.width / 2, canvas.height / 2);
  
  // Step 2: Rotate the canvas
  ctx.rotate(rotRad);
  
  // Step 3: Move back to where the image center should be relative to the crop
  // pixelCrop.x and pixelCrop.y are relative to the *rotated* image if using react-easy-crop
  // but react-easy-crop provides pixelCrop relative to the rotated bounding box when rotation > 0.
  // Actually, the simplest way is to draw the image centered and shifted by the crop offset
  ctx.translate(-pixelCrop.width / 2 - pixelCrop.x + image.width / 2, -pixelCrop.height / 2 - pixelCrop.y + image.height / 2);
  
  // Step 4: Shift back to top-left for drawImage
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.95);
};

interface AadharPrintProps {
  onToggleSidebar?: () => void;
}

export default function AadharPrint({ onToggleSidebar }: AadharPrintProps) {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [originalFront, setOriginalFront] = useState<string | null>(null);
  const [originalBack, setOriginalBack] = useState<string | null>(null);
  
  const [activeSide, setActiveSide] = useState<'front' | 'back' | null>(null);
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [showCropper, setShowCropper] = useState(false);
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        
        // Detect initial orientation
        const img = new Image();
        img.onload = () => {
          const isPortrait = img.height > img.width;
          
          if (side === 'front') setOriginalFront(result);
          else setOriginalBack(result);
          
          setActiveSide(side);
          setShowCropper(true);
          
          // Smart Auto-Orientation: rotate to landscape if tall
          setCrop({ x: 0, y: 0 });
          setZoom(1.1);
          setRotation(isPortrait ? 90 : 0);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const autoCrop = () => {
    // Standard ID card aspect ratio (8.6/5.4 ≈ 1.59)
    // We reset to center and slightly zoom to ensure it covers the frame edges
    const imgToUse = activeSide === 'front' ? originalFront : originalBack;
    if (imgToUse) {
      const img = new Image();
      img.onload = () => {
        const isPortrait = img.height > img.width;
        setCrop({ x: 0, y: 0 });
        setZoom(1.1); 
        setRotation(isPortrait ? 90 : 0);
      };
      img.src = imgToUse;
    } else {
      setCrop({ x: 0, y: 0 });
      setZoom(1.1); 
      setRotation(0);
    }
  };

  const saveCroppedImage = async () => {
    const imgToUse = activeSide === 'front' ? originalFront : originalBack;
    if (imgToUse && croppedAreaPixels) {
      try {
        const croppedImg = await getCroppedImg(imgToUse, croppedAreaPixels, rotation);
        if (activeSide === 'front') setFrontImage(croppedImg);
        else setBackImage(croppedImg);
        setShowCropper(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const clearImages = () => {
    setFrontImage(null);
    setBackImage(null);
    setOriginalFront(null);
    setOriginalBack(null);
    setActiveSide(null);
    setShowCropper(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 pb-24 font-sans max-w-[1400px] mx-auto">
      {/* Top Breadcrumb & User Header Row */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 no-print">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">
            <span className="opacity-60">Dashboard</span>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <span>Aadhaar Print</span>
          </nav>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Aadhaar Print</h1>
          <p className="text-slate-400 text-sm font-medium">Manage registration documents and expiry reminders effortlessly</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white rounded-full shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Terminal</span>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </div>

          <div className="relative">
            <button className="p-3 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400 hover:text-slate-600 transition-all hover:shadow-md">
              <Bell className="w-5 h-5" />
            </button>
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">3</span>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 transition-all hover:shadow-md cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-200">TA</div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-slate-900 leading-none">Tax Admin</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Administrator</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
          </div>

          <button 
            onClick={onToggleSidebar}
            className="w-14 h-14 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center active:scale-95"
          >
            <Menu className="w-6 h-6 text-[#1e293b]" />
          </button>
        </div>
      </div>

      {/* Tool Control Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 no-print pt-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Aadhaar Card Print Tool</h2>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1 opacity-60">Professional layout tool for identity card printing</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 no-print">
            <button 
              onClick={() => setOrientation('vertical')}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-3 ${orientation === 'vertical' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Layout className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Vertical</span>
            </button>
            <button 
              onClick={() => setOrientation('horizontal')}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-3 ${orientation === 'horizontal' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Layout className="w-4 h-4 rotate-90" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Horizontal</span>
            </button>
          </div>
          
          <button 
            onClick={clearImages}
            className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group active:scale-95"
          >
            <RefreshCw className="w-5 h-5 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Reset</span>
          </button>
          <button 
            disabled={!frontImage && !backImage}
            onClick={handlePrint}
            className={`flex items-center gap-4 px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95 ${!frontImage && !backImage ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1'}`}
          >
            <Printer className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Execute Print</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
        {/* Front Side Upload */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6">
          <div className="flex items-start gap-4">
             <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                <User className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Front Face Image</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-wider">Upload and preview front side of the Aadhaar card</p>
             </div>
             {frontImage && (
               <button 
                 onClick={() => { setActiveSide('front'); setShowCropper(true); }}
                 className="ml-auto flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
               >
                 <Scissors className="w-3 h-3" />
                 Re-Crop
               </button>
             )}
          </div>
          
          <label className={`relative group cursor-pointer block border-2 border-dashed border-slate-100 rounded-3xl transition-all hover:border-blue-400 hover:bg-blue-50/30 overflow-hidden ${!frontImage ? 'h-72' : ''}`}>
            {frontImage ? (
              <div className="relative p-2">
                <img src={frontImage} className="w-full h-full object-contain rounded-2xl shadow-inner bg-slate-50" alt="Front" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-sm">
                   <div className="bg-white px-6 py-3 rounded-full shadow-2xl">
                      <p className="text-slate-900 text-[10px] font-black uppercase tracking-widest">Change Image</p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-4 text-slate-400">
                <div className="w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center mb-2">
                  <Upload className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-center">
                  <p className="text-slate-500 text-xs font-bold leading-relaxed">Drag & drop front side image here<br/><span className="text-blue-500">or click to browse</span></p>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'front')} className="hidden" />
          </label>

          <div className="flex items-center gap-3 px-5 py-3 bg-blue-50/30 rounded-2xl border border-blue-100/50">
             <Bell className="w-4 h-4 text-blue-400" />
             <p className="text-[9px] font-black text-blue-600/70 uppercase tracking-widest">Supported formats: JPG, PNG, JPEG (Max 5MB)</p>
          </div>
        </div>

        {/* Back Side Upload */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6">
          <div className="flex items-start gap-4">
             <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                <ImageIcon className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Back Face Image</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-wider">Upload and preview back side of the Aadhaar card</p>
             </div>
             {backImage && (
               <button 
                 onClick={() => { setActiveSide('back'); setShowCropper(true); }}
                 className="ml-auto flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
               >
                 <Scissors className="w-3 h-3" />
                 Re-Crop
               </button>
             )}
          </div>
          
          <label className={`relative group cursor-pointer block border-2 border-dashed border-slate-100 rounded-3xl transition-all hover:border-emerald-400 hover:bg-emerald-50/30 overflow-hidden ${!backImage ? 'h-72' : ''}`}>
            {backImage ? (
              <div className="relative p-2">
                <img src={backImage} className="w-full h-full object-contain rounded-2xl shadow-inner bg-slate-50" alt="Back" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-sm">
                   <div className="bg-white px-6 py-3 rounded-full shadow-2xl">
                      <p className="text-slate-900 text-[10px] font-black uppercase tracking-widest">Change Image</p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-4 text-slate-400">
                <div className="w-20 h-20 bg-emerald-50/50 rounded-full flex items-center justify-center mb-2">
                  <Upload className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="text-slate-500 text-xs font-bold leading-relaxed">Drag & drop back side image here<br/><span className="text-emerald-500">or click to browse</span></p>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'back')} className="hidden" />
          </label>

          <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
             <Bell className="w-4 h-4 text-emerald-400" />
             <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest">Supported formats: JPG, PNG, JPEG (Max 5MB)</p>
          </div>
        </div>
      </div>

      {/* Preview Section - Redesigned to match screenshot */}
      <section className="space-y-6 no-print">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Live Print Preview</h3>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Control Sidebar for Preview */}
            <div className="lg:w-80 space-y-6">
              <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100/50 space-y-4">
                 <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Printer className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Aadhaar Card Layout</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider leading-relaxed">This is how your Aadhaar card will look when printed</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 <div className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                       <RotateCw className="w-4 h-4 text-blue-500" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Orientation</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{orientation}</span>
                 </div>
                 <div className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                       <FileText className="w-4 h-4 text-blue-500" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paper Size</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">A4</span>
                 </div>
              </div>
            </div>

            {/* Print Stage */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200 p-12 min-h-[500px] overflow-auto">
               <div className={`flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'} gap-8 items-center justify-center`}>
                  <div className="flex flex-col items-center gap-4 group">
                    <div className="relative w-[320px] h-[200px] border-2 border-white bg-white rounded-2xl shadow-xl overflow-hidden transition-all group-hover:scale-[1.02]">
                      {frontImage ? (
                        <img src={frontImage} className="w-full h-full object-contain" alt="Front Preview" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 bg-slate-50/50">
                           <User className="w-12 h-12 mb-2" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Front Position</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Front Side</p>
                  </div>

                  <div className="flex flex-col items-center gap-4 group">
                    <div className="relative w-[320px] h-[200px] border-2 border-white bg-white rounded-2xl shadow-xl overflow-hidden transition-all group-hover:scale-[1.02]">
                      {backImage ? (
                        <img src={backImage} className="w-full h-full object-contain" alt="Back Preview" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 bg-slate-50/50">
                           <ImageIcon className="w-12 h-12 mb-2" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Back Position</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Back Side</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actual Print View (Hidden on screen) */}
      <div className="hidden print:block print-only fixed inset-0 z-[1000] bg-white p-0 m-0">
        <div className={`flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'} items-center gap-[0.5cm] pt-[1cm] justify-center`}>
           {frontImage && <img src={frontImage} className="w-[8.6cm] h-[5.4cm] object-cover border border-slate-300 rounded-[3mm] shrink-0" />}
           {backImage && <img src={backImage} className="w-[8.6cm] h-[5.4cm] object-cover border border-slate-300 rounded-[3mm] shrink-0" />}
        </div>
      </div>

      {/* Crop Modal Matches User UI Screenshot */}
      <AnimatePresence>
        {showCropper && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-modern-text/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 px-10 flex items-center justify-between bg-white/50 border-b border-modern-border">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-modern-text uppercase tracking-tight">Crop & Rotate {activeSide}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-modern-muted mt-1">Adjust your ID card image for perfect scale</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <button 
                    onClick={autoCrop}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-modern-blue px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                   >
                      <Scan className="w-4 h-4" />
                      Auto Crop
                   </button>
                   <button 
                    onClick={saveCroppedImage}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-200"
                   >
                      <CheckCircle2 className="w-4 h-4" />
                      Save
                   </button>
                   <button 
                    onClick={() => setShowCropper(false)}
                    className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Cropper Body */}
              <div className="flex-1 relative bg-[#0a0a0b] min-h-[400px]">
                <Cropper
                  image={activeSide === 'front' ? originalFront! : originalBack!}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={8.6 / 5.4}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Controls Footer */}
              <div className="p-10 space-y-10 bg-white shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted">Zoom Intensity</label>
                       <span className="text-[10px] font-black text-rose-400">{Math.round(zoom * 100)}%</span>
                    </div>
                    <input 
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-rose-400 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted">Rotation Angle</label>
                       <span className="text-[10px] font-black text-rose-400">{rotation}°</span>
                    </div>
                    <input 
                      type="range"
                      value={rotation}
                      min={0}
                      max={360}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-rose-400 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                   <button 
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="flex-1 flex items-center justify-center gap-3 bg-slate-50 text-modern-text py-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-modern-border"
                   >
                     <RotateCw className="w-5 h-5 text-modern-blue" />
                     Rotate 90°
                   </button>
                   <button 
                    onClick={saveCroppedImage}
                    className="flex-[2] bg-rose-400 text-white py-5 rounded-[24px] font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-rose-400/30 transition-all flex items-center justify-center gap-4"
                   >
                     <CheckCircle2 className="w-5 h-5" />
                     Apply & Save Layout
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
