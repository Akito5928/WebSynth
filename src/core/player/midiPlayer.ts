import * as Tone from "tone";
import { useEffect, useRef, useState } from "react";

// 音源ファイル不要の合成音色セット
const INSTRUMENTS: any = {
  synth: () =>
    new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.8 },
    }),

  pianoLike: () =>
    new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 10,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 1.2 },
    }),

  violinLike: () =>
    new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.3, decay: 0.1, sustain: 0.8, release: 1.5 },
    }),

  pad: () =>
    new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 1.0, decay: 0.2, sustain: 0.9, release: 2.0 },
    }),

  chip: () =>
    new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "square" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 },
    }),
};

export function useMidiPlayer(midi: any | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [instrument, setInstrument] = useState("synth");

  const synthRef = useRef<any>(null);
  const partRef = useRef<any>(null);

  // 初期化
  useEffect(() => {
    synthRef.current = INSTRUMENTS[instrument]().toDestination();
    return () => synthRef.current.dispose();
  }, []);

  // 音色変更
  useEffect(() => {
    if (synthRef.current) synthRef.current.dispose();
    synthRef.current = INSTRUMENTS[instrument]().toDestination();
  }, [instrument]);

  // アニメーション
  useEffect(() => {
    let id: number;
    const loop = () => {
      setCurrentTime(Tone.Transport.seconds);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  const play = async () => {
    if (!midi) return;

    await Tone.start();

    // 前回の Part を破棄
    if (partRef.current) {
      partRef.current.dispose();
      partRef.current = null;
    }

    const synth = synthRef.current;

    // Tone.Part を使う（Transport.schedule より安全）
    const events = midi.tracks[0].notes.map((n: any) => ({
      time: n.time,
      note: n.name,
      duration: n.duration,
    }));

    partRef.current = new Tone.Part((time, value) => {
      synth.triggerAttackRelease(value.note, value.duration, time);
    }, events).start(0);

    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Tone.Transport.start("+0.05");

    setIsPlaying(true);
  };

  const stop = () => {
    Tone.Transport.stop();
    Tone.Transport.position = 0;

    if (partRef.current) {
      partRef.current.stop();
    }

    synthRef.current.releaseAll();
    setIsPlaying(false);
  };

  return {
    play,
    stop,
    isPlaying,
    currentTime,
    instrument,
    setInstrument,
  };
}
