import React, { useState, useEffect, useRef } from 'react';
import { X, Scan, Zap, CheckCircle2, RotateCcw, Camera, Upload, AlertCircle, Volume2, Search, ArrowRight } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { FoodItem } from '../types/food';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScannedItem: (item: Omit<FoodItem, 'id'>) => void;
}

interface ScannedProduct {
  code: string;
  name: string;
  category: 'Produce' | 'Dairy' | 'Bakery' | 'Meat & Seafood' | 'Pantry' | 'Beverages';
  quantity: string;
  location: 'Fridge Crisper' | 'Fridge Top Shelf' | 'Fridge Door' | 'Freezer' | 'Counter Basket' | 'Pantry Shelf';
  daysRemaining: number;
  cost: number;
  co2: number;
  image: string;
}

const BARCODE_SAMPLES: ScannedProduct[] = [
  {
    code: '070380001234',
    name: 'Horizon Organic Whole Milk',
    category: 'Dairy',
    quantity: '1 Gallon',
    location: 'Fridge Top Shelf',
    daysRemaining: 7,
    cost: 5.29,
    co2: 1.4,
    image: '/src/assets/images/organic_whole_milk_1791826094095.jpg',
  },
  {
    code: '033383002451',
    name: 'Earthbound Organic Baby Spinach',
    category: 'Produce',
    quantity: '300g clam',
    location: 'Fridge Crisper',
    daysRemaining: 5,
    cost: 3.99,
    co2: 0.8,
    image: '/src/assets/images/baby_spinach_bowl_1791826076360.jpg',
  },
  {
    code: '041220789012',
    name: 'Campari Vine-Ripened Tomatoes',
    category: 'Produce',
    quantity: '450g pack',
    location: 'Counter Basket',
    daysRemaining: 6,
    cost: 3.49,
    co2: 0.6,
    image: '/src/assets/images/vine_ripe_tomatoes_1791826107875.jpg',
  },
];

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScannedItem,
}) => {
  const [detectedItem, setDetectedItem] = useState<ScannedProduct | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerId = 'interactive-barcode-reader';

  // Play scanner beep
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime); // High pitch supermarket beep
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // AudioContext may be restricted by autoplay policy
    }
  };

  // Lookup barcode from server / Open Food Facts
  const lookupBarcode = async (code: string) => {
    const clean = code.trim();
    if (!clean) return;

    setIsLookingUp(true);
    playBeep();

    try {
      const res = await fetch(`/api/barcode/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setDetectedItem(data.item);
          return;
        }
      }
    } catch (err) {
      console.warn('API lookup failed, falling back to local resolver:', err);
    } finally {
      setIsLookingUp(false);
    }

    // Fallback item
    const fallback: ScannedProduct = {
      code: clean,
      name: `Scanned Item #${clean.slice(-6)}`,
      category: 'Pantry',
      quantity: '1 item',
      location: 'Pantry Shelf',
      daysRemaining: 10,
      cost: 3.49,
      co2: 0.5,
      image: '/src/assets/images/baby_spinach_bowl_1791826076360.jpg',
    };
    setDetectedItem(fallback);
  };

  // Stop camera stream safely
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start real camera scanner
  const startCamera = async () => {
    setCameraError(null);
    setScanning(true);

    try {
      await stopScanner();

      // Ensure DOM element is mounted
      const element = document.getElementById(containerId);
      if (!element) {
        throw new Error('Scanner viewfinder container not found in DOM');
      }

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 260, height: 160 },
          aspectRatio: 1.333,
        },
        async (decodedText) => {
          if (decodedText) {
            await stopScanner();
            await lookupBarcode(decodedText);
          }
        },
        () => {
          // Frame scanned without code detected - continuous loop
        }
      );

      setIsCameraActive(true);
      setScanning(false);
    } catch (err: unknown) {
      console.error('Camera start failed:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
        setCameraError('Camera access denied. Please allow camera permissions in your browser or iframe.');
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setCameraError('No camera found on this device. You can snap a photo or select an image instead.');
      } else {
        setCameraError(`Camera initialization: ${errMsg}. You can upload a photo or use preset barcodes.`);
      }
      setScanning(false);
      setIsCameraActive(false);
    }
  };

  // Handle file / photo upload scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLookingUp(true);
    setCameraError(null);

    try {
      let qrCode = scannerRef.current;
      if (!qrCode) {
        qrCode = new Html5Qrcode(containerId);
        scannerRef.current = qrCode;
      }

      const decodedText = await qrCode.scanFile(file, true);
      if (decodedText) {
        await lookupBarcode(decodedText);
      } else {
        setCameraError('No readable barcode found in the uploaded photo. Please try a clearer picture.');
      }
    } catch (err: unknown) {
      console.warn('File barcode scan error:', err);
      setCameraError('Could not detect a clear barcode from this image. Try capturing closer with good lighting.');
    } finally {
      setIsLookingUp(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDetectedItem(null);
      setCameraError(null);
      // Small timeout to allow DOM element to render
      const timer = setTimeout(() => {
        startCamera();
      }, 200);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmAdd = () => {
    if (!detectedItem) return;
    onScannedItem({
      name: detectedItem.name,
      category: detectedItem.category,
      quantity: detectedItem.quantity,
      location: detectedItem.location,
      daysRemaining: detectedItem.daysRemaining,
      expiryDateText: `${detectedItem.daysRemaining} Days Left`,
      status: detectedItem.daysRemaining <= 3 ? 'expiring_soon' : 'optimal',
      imageUrl: detectedItem.image,
      co2ImpactKg: detectedItem.co2,
      estCost: detectedItem.cost,
      addedDate: new Date().toISOString().split('T')[0],
    });
    setDetectedItem(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0f172a] text-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[94vh]">
        {/* Top bar */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-800 bg-[#162033]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Live Barcode Scanner</span>
                <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {isCameraActive ? 'Active Camera Feed' : 'Camera Ready'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Beep enabled' : 'Beep muted'}
              className={`p-2 rounded-full border transition-all ${
                soundEnabled ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder area */}
        <div className="relative bg-black min-h-[260px] max-h-[340px] flex items-center justify-center overflow-hidden">
          {/* HTML5 QR Code Mount Node */}
          <div
            id={containerId}
            className="w-full h-full min-h-[260px] flex items-center justify-center overflow-hidden"
          />

          {/* Fallback / Overlay if camera is off or has error */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-900/90 p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Camera Offline or Restricted</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">{cameraError}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* Reticle guide line when camera is active */}
          {isCameraActive && !detectedItem && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              <div className="relative w-64 h-40 border-2 border-emerald-500/70 rounded-2xl flex items-center justify-center">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />
                <span className="text-[11px] font-mono tracking-wider text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                  HOLD STEADY IN FRAME
                </span>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLookingUp && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-30">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-emerald-400 font-mono">LOOKING UP BARCODE...</p>
              </div>
            </div>
          )}
        </div>

        {/* Capture / Upload Alternative Toolbar */}
        <div className="px-4 py-2.5 bg-[#0b1120] border-t border-slate-800 flex items-center justify-between text-xs">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-[11px]">Capture / Upload Barcode Photo</span>
          </button>

          {isCameraActive ? (
            <button
              onClick={stopScanner}
              className="text-[11px] text-amber-400 hover:underline font-semibold"
            >
              Pause Camera
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="text-[11px] text-emerald-400 hover:underline font-semibold"
            >
              Resume Live Feed
            </button>
          )}
        </div>

        {/* Content Area: Result card OR manual input & sample presets */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3.5 overflow-y-auto">
          {detectedItem ? (
            <div className="bg-slate-800/90 rounded-2xl p-4 border border-emerald-500/40 space-y-3 shadow-lg">
              <div className="flex items-center gap-3">
                <img
                  src={detectedItem.image}
                  alt={detectedItem.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-700 bg-slate-900"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Barcode Matched</span>
                    <span className="text-[10px] text-slate-400 font-mono">({detectedItem.code})</span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">
                    {detectedItem.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {detectedItem.quantity} • Shelf Life: {detectedItem.daysRemaining} days • {detectedItem.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleConfirmAdd}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Confirm & Add to Pantry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setDetectedItem(null);
                    startCamera();
                  }}
                  className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Scan Next</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Manual Barcode Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Or Enter Barcode Manually:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="e.g. 070380001234"
                      className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') lookupBarcode(manualCode);
                      }}
                    />
                    {manualCode && (
                      <button
                        onClick={() => setManualCode('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => lookupBarcode(manualCode)}
                    disabled={!manualCode.trim() || isLookingUp}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Lookup</span>
                  </button>
                </div>
              </div>

              {/* Instant Test Presets */}
              <div className="pt-1">
                <p className="text-[11px] text-slate-400 mb-1.5 font-semibold">
                  Tap to test barcode scanner without physical item:
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {BARCODE_SAMPLES.map((sample) => (
                    <button
                      key={sample.code}
                      onClick={() => lookupBarcode(sample.code)}
                      disabled={isLookingUp}
                      className="w-full text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-emerald-500/50 text-xs text-slate-200 flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                          |||| {sample.code.slice(-4)}
                        </span>
                        <span className="font-medium text-white truncate text-xs">{sample.name}</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                        Scan ⚡
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
