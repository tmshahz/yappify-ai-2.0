import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  active: boolean;
  stream?: MediaStream | null;
}

export const Waveform: React.FC<WaveformProps> = ({ active, stream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Setup Audio Context & Analyser when stream changes
  useEffect(() => {
    if (active && stream) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256; // Controls granularity
      source.connect(analyser);

      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      return () => {
        // Cleanup specific to this stream session if needed
        // Note: We generally keep context alive but disconnect nodes
        source.disconnect();
        analyser.disconnect();
      };
    }
  }, [active, stream]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (handling retina displays for sharpness)
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const computedStyle = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.classList.contains('dark');
    const tokenViolet = computedStyle.getPropertyValue('--yap-violet').trim() || '#7C5CFC';
    const strokeColor = isDark ? tokenViolet : '#000000';
    const bufferLength = Math.max(48, Math.floor(rect.width / 4));
    let amplitudeHistory: number[] = new Array(bufferLength).fill(0);
    let smoothedAmplitude = 0;

    const draw = () => {
      let targetAmplitude = 0;
      
      if (active && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += Math.abs(dataArrayRef.current[i] - 128);
        }
        const average = sum / dataArrayRef.current.length;
        targetAmplitude = Math.min(1, average / 24);
      }

      smoothedAmplitude += (targetAmplitude - smoothedAmplitude) * 0.18;
      amplitudeHistory.shift();
      amplitudeHistory.push(active ? smoothedAmplitude : 0);

      ctx.clearRect(0, 0, rect.width, rect.height);

      ctx.lineWidth = active ? 3 : 2;
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = active ? 0.7 : 0.15;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      
      const sliceWidth = rect.width / amplitudeHistory.length;
      const centerY = rect.height / 2;
      const maxAmplitude = rect.height * 0.36;
      let x = 0;

      for (let i = 0; i < amplitudeHistory.length; i++) {
        const wave = active ? Math.sin(i * 0.42) : 0;
        const y = centerY - (amplitudeHistory[i] * maxAmplitude * wave);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();
      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active]); // Re-run if active state toggles to reset or continue

  return (
    <div className="w-full h-16 overflow-hidden relative">
       <canvas 
         ref={canvasRef} 
         className="w-full h-full block"
       />
    </div>
  );
};