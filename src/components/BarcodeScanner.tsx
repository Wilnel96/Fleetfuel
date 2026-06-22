import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Scan, Keyboard, Zap } from 'lucide-react';
import { BrowserPDF417Reader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';

interface BarcodeScannerProps {
  onScan: (data: string) => void;
  onCancel: () => void;
  label: string;
}

interface ScanControls {
  stop: () => void;
  streamVideoConstraintsApply?: (constraints: MediaTrackConstraints) => Promise<void>;
}

export default function BarcodeScanner({ onScan, onCancel, label }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<ScanControls | null>(null);
  const readerRef = useRef<BrowserPDF417Reader | null>(null);

  const [scannedData, setScannedData] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      try { controlsRef.current.stop(); } catch (_) { /* ignore */ }
      controlsRef.current = null;
    }
    readerRef.current = null;
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    stopScanning();
    setError('');
    setScannedData('');
    setTorchOn(false);
    setTorchAvailable(false);

    // Wait for the video element to be in the DOM
    if (!videoRef.current) {
      await new Promise<void>(resolve => setTimeout(resolve, 100));
    }
    if (!videoRef.current) {
      setError('Could not initialise camera. Please tap Retry.');
      return;
    }

    try {
      const hints = new Map();
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.PDF_417]);

      const reader = new BrowserPDF417Reader(hints, {
        delayBetweenScanAttempts: 150,
        delayBetweenScanSuccess: 500,
      });
      readerRef.current = reader;

      // Use rear camera — ZXing owns the stream lifecycle
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      setIsScanning(true);

      const controls = await reader.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result, err, ctrl) => {
          if (!controlsRef.current) {
            // Already stopped — ignore stale callbacks
            return;
          }

          if (result) {
            const text = result.getText();
            controlsRef.current = null;
            ctrl.stop();
            readerRef.current = null;
            setIsScanning(false);
            setScannedData(text);
            return;
          }

          // Check if torch is available after stream starts (first callback)
          if (ctrl && typeof (ctrl as any).switchTorch === 'function' && !torchAvailable) {
            setTorchAvailable(true);
          }
        }
      );

      // Store controls so we can stop from outside the callback
      controlsRef.current = controls as ScanControls;

      // Check torch availability via the controls object
      if (typeof (controls as any).switchTorch === 'function') {
        setTorchAvailable(true);
      }

    } catch (err: any) {
      console.error('Scanner error:', err);
      setIsScanning(false);
      controlsRef.current = null;
      readerRef.current = null;

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. On your phone, go to Settings > Apps > Browser > Permissions and enable Camera, then tap Retry.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device. Enter the registration number manually using the button below.');
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        setError('Camera could not start with HD settings. Retrying with basic settings...');
        setTimeout(() => startScanningBasic(), 500);
      } else if (err.message?.includes('Could not start video source') || err.name === 'AbortError') {
        setError('Camera is in use by another app. Close other apps using the camera then tap Retry.');
      } else {
        setError(`Camera error: ${err.message || err.name}. Tap Retry or enter manually.`);
      }
    }
  }, [stopScanning]);

  const startScanningBasic = useCallback(async () => {
    setError('');
    try {
      const hints = new Map();
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.PDF_417]);

      const reader = new BrowserPDF417Reader(hints, {
        delayBetweenScanAttempts: 200,
        delayBetweenScanSuccess: 500,
      });
      readerRef.current = reader;

      setIsScanning(true);

      const controls = await reader.decodeFromConstraints(
        { video: true },
        videoRef.current!,
        (result, _err, ctrl) => {
          if (!controlsRef.current) return;
          if (result) {
            const text = result.getText();
            controlsRef.current = null;
            ctrl.stop();
            readerRef.current = null;
            setIsScanning(false);
            setScannedData(text);
          }
        }
      );

      controlsRef.current = controls as ScanControls;
    } catch (err: any) {
      setIsScanning(false);
      setError('Could not start camera. Please enter the registration number manually.');
    }
  }, []);

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  const handleToggleTorch = async () => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current as any;
    if (typeof ctrl.switchTorch !== 'function') return;
    try {
      const next = !torchOn;
      await ctrl.switchTorch(next);
      setTorchOn(next);
    } catch (_) { /* torch not supported */ }
  };

  const handleRescan = () => {
    setScannedData('');
    setError('');
    setShowManual(false);
    startScanning();
  };

  const handleConfirm = () => {
    if (scannedData) {
      onScan(scannedData);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualInput.trim().toUpperCase();
    if (trimmed) {
      onScan(trimmed);
    }
  };

  const handleCancel = () => {
    stopScanning();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-gray-900 p-4 flex items-center justify-between flex-shrink-0">
        <h2 className="text-white text-lg font-semibold">{label}</h2>
        <button onClick={handleCancel} className="text-white hover:text-gray-300 p-1">
          <X className="w-6 h-6" />
        </button>
      </div>

      {!showManual ? (
        <>
          <div className="flex-1 bg-black relative overflow-hidden">
            {/* Video element always rendered so ZXing can attach to it */}
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: scannedData ? 'none' : 'block',
              }}
              playsInline
              muted
            />

            {!scannedData && isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {/* Scan target overlay */}
                <div className="border-2 border-green-400 rounded-lg w-[85%] h-[28%] relative">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-green-400 rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-green-400 rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-green-400 rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-green-400 rounded-br" />
                  {/* Scan line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-400 opacity-80 animate-[scan_2s_ease-in-out_infinite]" />
                </div>

                <div className="mt-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                  <Scan className="w-4 h-4 animate-pulse text-green-400 flex-shrink-0" />
                  <span>Align the PDF417 barcode inside the frame</span>
                </div>
              </div>
            )}

            {!scannedData && !isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <Camera className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}

            {scannedData && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 w-full max-w-md">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-3">
                      <Scan className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-900 mb-1">Barcode Scanned!</h3>
                    <p className="text-sm text-green-700">License disk barcode captured successfully.</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <p className="text-xs font-medium text-gray-500 mb-1">Raw Data:</p>
                    <p className="text-xs text-gray-700 font-mono break-all bg-gray-50 p-2 rounded border border-gray-200 max-h-24 overflow-y-auto">
                      {scannedData}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Torch toggle button — top right over video */}
            {torchAvailable && isScanning && !scannedData && (
              <button
                onClick={handleToggleTorch}
                className={`absolute top-3 right-3 p-2 rounded-full transition-colors pointer-events-auto ${
                  torchOn ? 'bg-yellow-400 text-gray-900' : 'bg-black bg-opacity-60 text-white'
                }`}
              >
                <Zap className="w-5 h-5" />
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-700 text-white px-4 py-3 flex-shrink-0">
              <p className="text-sm text-center">{error}</p>
            </div>
          )}

          <div className="bg-gray-900 p-4 flex-shrink-0">
            {scannedData ? (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRescan}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Rescan
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors font-semibold"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleRescan}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
                <button
                  onClick={() => { stopScanning(); setShowManual(true); }}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
                >
                  <Keyboard className="w-4 h-4" />
                  Enter Manually
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 bg-gray-900 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Registration Number</h3>
            <p className="text-sm text-gray-500 mb-4">
              Type the vehicle registration number exactly as it appears on the license disk.
            </p>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <input
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value.toUpperCase())}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-4 text-xl font-bold tracking-widest uppercase text-center focus:border-blue-500 focus:outline-none"
                placeholder="e.g. CA123456"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Use This Registration
              </button>
              <button
                type="button"
                onClick={() => { setShowManual(false); startScanning(); }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Try Camera Again
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
