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

    // Buffer to hold waveform history
    // We'll store amplitude values (0-255)
    // Width of canvas determines history length
    const bufferLength = rect.width; 
    let amplitudeHistory: number[] = new Array(Math.floor(bufferLength)).fill(128);

    const draw = () => {
      // 1. Get new data
      let currentAmplitude = 128; // Center (silence)
      
      if (active && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        // Calculate an average or peak for this frame to represent volume
        // TimeDomain data goes from 0 to 255, 128 is silence.
        let sum = 0;
        for(let i = 0; i < dataArrayRef.current.length; i++) {
           sum += Math.abs(dataArrayRef.current[i] - 128);
        }
        // Amplify the visual effect
        const average = sum / dataArrayRef.current.length;
        currentAmplitude = 128 + (average * 4); // Scale up for visibility
        // Clamp
        if (currentAmplitude > 255) currentAmplitude = 255;
        if (currentAmplitude < 0) currentAmplitude = 0;
      }

      // 2. Shift history
      amplitudeHistory.shift(); // Remove oldest
      // Push new value twice to speed up scrolling slightly or just once
      amplitudeHistory.push(active ? currentAmplitude : 128);

      // 3. Clear Canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // 4. Draw Line
      ctx.lineWidth = 3;
      // Dark mode check handled by parent passing class or checking computed style? 
      // We'll use CSS variable or simple detection, but for now specific colors requested:
      // Light: Black line, Dark: White line.
      const isDark = document.documentElement.classList.contains('dark');
      ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      
      const sliceWidth = rect.width / amplitudeHistory.length;
      let x = 0;

      for (let i = 0; i < amplitudeHistory.length; i++) {
        // Map 0-255 to canvas height
        // 128 is center (rect.height / 2)
        // Value 0 -> rect.height
        // Value 255 -> 0
        const v = amplitudeHistory[i] / 255.0; // 0.0 to 1.0
        
        // Invert y so higher values go up
        const y = (1 - v) * rect.height; 

        // Apply idle thick line logic visually if needed, but 128 data produces straight line naturally
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

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
    <div className="w-full h-24 bg-white dark:bg-black rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm relative">
       <canvas 
         ref={canvasRef} 
         className="w-full h-full block"
       />
       {/* Idle visual helper if needed, though canvas handles it */}
       {!active && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           {/* Purely decorative overlay if we wanted, but the canvas draws the line */}
         </div>
       )}
    </div>
  );
};