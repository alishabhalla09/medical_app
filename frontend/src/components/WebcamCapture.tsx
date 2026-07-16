import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCcw, Check, X } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const submit = () => {
    if (imgSrc) {
      // Convert dataURI to blob
      const byteString = atob(imgSrc.split(',')[1]);
      const mimeString = imgSrc.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      onCapture(blob);
    }
  };

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 7, 12, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="flex align-center justify-between">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Webcam Dermal Check</h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer' 
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          backgroundColor: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-glass)'
        }}>
          {imgSrc ? (
            <img 
              src={imgSrc} 
              alt="captured webcam frame" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        <div className="flex gap-4 justify-center">
          {imgSrc ? (
            <>
              <button className="btn btn-secondary" onClick={retake}>
                <RotateCcw size={18} />
                Retake
              </button>
              <button className="btn btn-primary" onClick={submit}>
                <Check size={18} />
                Confirm & Submit
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={capture}>
              <Camera size={18} />
              Capture Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
