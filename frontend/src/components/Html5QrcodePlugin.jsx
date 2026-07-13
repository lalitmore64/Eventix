import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export const Html5QrcodePlugin = ({ onScanSuccess, onScanFailure }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scannerId = "qr-scanner-element";
    const html5Qrcode = new Html5Qrcode(scannerId);
    scannerRef.current = html5Qrcode;

    const config = {
      fps: 10,
      qrbox: (width, height) => {
        const size = Math.min(width, height) * 0.7;
        return { width: size, height: size };
      }
    };

    html5Qrcode.start(
      { facingMode: "environment" },
      config,
      (decodedText, decodedResult) => {
        if (onScanSuccess) {
          onScanSuccess(decodedText, decodedResult);
        }
      },
      (errorMessage) => {
        if (onScanFailure) {
          onScanFailure(errorMessage);
        }
      }
    ).catch(err => {
      console.error("Error starting camera QR scanner:", err);
    });

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop()
            .then(() => {
              console.log("Scanner stopped successfully");
            })
            .catch(err => {
              console.error("Failed to stop scanner on unmount:", err);
            });
        }
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '300px', 
        overflow: 'hidden', 
        borderRadius: '12px', 
        border: '1px solid var(--border)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
      }}>
        <div 
          id="qr-scanner-element" 
          style={{ 
            width: '100%', 
            aspectRatio: '1', 
            background: '#0a0f1d'
          }} 
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          border: '2px solid rgba(6, 182, 212, 0.3)',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '65%',
            aspectRatio: '1',
            border: '2px dashed var(--accent-cyan)',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.15)'
          }} />
        </div>
      </div>
    </div>
  );
};
