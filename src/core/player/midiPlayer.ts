import * as Tone from "tone";
import { useEffect, useRef, useState } from "react";
import WavEncoder from "wav-encoder";

// 固定読み込み（Piano & Violin）
import pianoTone from "../../webaudiofont/sound/0000_FluidR3_GM_sf2_file.js";
import violinTone from "../../webaudiofont/sound/0040_FluidR3_GM_sf2_file.js";

const GM_PIANO = 0;
const GM_VIOLIN = 40;

export function useMidiPlayer(midi: any | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [instrument, setInstrument] = useState("synth");
  const [gmProgram, setGmProgram] = useState<number | null>(null);

  const synthRef = useRef<any>(null);
  const partRef = useRef<any>(null);

  // WebAudioFontPlayer（UMD）
  const wafPlayerRef = useRef<any>(null);
  const wafToneRef = useRef<any>(null);

  // 初期化
  useEffect(() => {
    const PlayerClass = (window as any).WebAudioFontPlayer;
    wafPlayerRef.current = new PlayerClass();
    initInstrument("synth");
  }, []);

  // 楽器切り替え
  useEffect(() => {
    initInstrument(instrument);
  }, [instrument]);

  async function initInstrument(name: string) {
    if (synthRef.current) synthRef.current.dispose();

    if (name === "synth") {
      synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
      setGmProgram(null);
      return;
    }

    if (name === "pad") {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 1, decay: 0.2, sustain: 0.9, release: 2 }
      }).toDestination();
      setGmProgram(null);
      return;
    }

    if (name === "chip") {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 }
      }).toDestination();
      setGmProgram(null);
      return;
    }

    const audioContext = Tone.getContext().rawContext;

    if (name === "piano") {
      wafToneRef.current = pianoTone;
      wafPlayerRef.current.loader.decodeAfterLoading(
        audioContext,
        "0000_FluidR3_GM_sf2_file"
      );
      setGmProgram(GM_PIANO);
      return;
    }

    if (name === "violin") {
      wafToneRef.current = violinTone;
      wafPlayerRef.current.loader.decodeAfterLoading(
        audioContext,
        "0040_FluidR3_GM_sf2_file"
      );
      setGmProgram(GM_VIOLIN);
      return;
    }

    if (name === "gm") {
      if (gmProgram === null) return;

      const padded = gmProgram.toString().padStart(4, "0");

      const module = await import(
        `../../webaudiofont/sound/${padded}_FluidR3_GM_sf2_file.js`
      );

      wafToneRef.current = module.default;
      wafPlayerRef.current.loader.decodeAfterLoading(
        audioContext,
        `${padded}_FluidR3_GM_sf2_file`
      );
      return;
    }
  }

  // 再生
  const play = async () => {
    if (!midi) return;

    await Tone.start();

    // 古い Part を破棄
    if (partRef.current) {
      partRef.current.dispose();
      partRef.current = null;
    }

    const events = midi.tracks[0].notes.map((n: any) => ({
      time: n.time,
      note: n.midi,
      duration: n.duration
    }));

    // Transport を完全リセット
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Tone.Transport.cancel(); // ← 古いイベントを消す

    // Part をスケジュール（cancel の後）
    partRef.current = new Tone.Part((time, value) => {
      if (instrument === "synth" || instrument === "pad" || instrument === "chip") {
        synthRef.current.triggerAttackRelease(
          Tone.Frequency(value.note, "midi"),
          value.duration,
          time
        );
      } else {
        const ctx = Tone.getContext().rawContext;
        const when = ctx.currentTime + (time - Tone.now());

        wafPlayerRef.current.queueWaveTable(
          ctx,
          ctx.destination,
          wafToneRef.current,
          when,
          value.note,
          value.duration
        );
      }
    }, events).start(0);

    // Transport を開始
    Tone.Transport.start();

    setIsPlaying(true);
  };

  // 停止
  const stop = () => {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    if (partRef.current) partRef.current.stop();
    synthRef.current?.releaseAll?.();
    setIsPlaying(false);
  };

  // currentTime を UI に流すループ（ノーツが動く）
  useEffect(() => {
    let id: any;

    if (isPlaying) {
      id = setInterval(() => {
        setCurrentTime(Tone.Transport.seconds);
      }, 30);
    }

    return () => clearInterval(id);
  }, [isPlaying]);

  // WAV 書き出し
  const exportWav = async () => {
    if (!midi) return null;

    const duration = midi.duration + 1;
    const offline = new Tone.OfflineContext(2, duration * 44100, 44100);

    const PlayerClass = (window as any).WebAudioFontPlayer;
    const player = new PlayerClass();
    const tone = wafToneRef.current;

    const events = midi.tracks[0].notes;

    events.forEach((n: any) => {
      player.queueWaveTable(
        offline.rawContext,
        offline.rawContext.destination,
        tone,
        n.time,
        n.midi,
        n.duration
      );
    });

    const buffer = await offline.render();
    const wav = await WavEncoder.encode({
      sampleRate: buffer.sampleRate,
      channelData: [buffer.getChannelData(0), buffer.getChannelData(1)]
    });

    return new Blob([wav], { type: "audio/wav" });
  };

  return {
    play,
    stop,
    exportWav,
    isPlaying,
    currentTime,
    instrument,
    setInstrument,
    gmProgram,
    setGmProgram
  };
}
