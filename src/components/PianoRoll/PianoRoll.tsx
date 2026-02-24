import { useRef, useEffect } from 'react';

type Props = {
  midi: any | null;
  currentTime: number;
};

export function PianoRoll({ midi, currentTime }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!midi) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const track = midi.tracks[0];
    const pixelsPerSecond = 100;

    track.notes.forEach((n: any) => {
      const x = (n.midi - 21) * 8;
      const y = height - (n.time - currentTime) * pixelsPerSecond;
      const h = n.duration * pixelsPerSecond;
      ctx.fillStyle = '#4fc3f7';
      ctx.fillRect(x, y, 6, h);
    });
  }, [midi, currentTime]);

  return <canvas ref={canvasRef} width={800} height={400} />;
}
