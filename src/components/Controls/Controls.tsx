import { useState } from "react";
import { GM_CATEGORIES } from "../../core/gmCategories";

type Props = {
  player: {
    play: () => void;
    stop: () => void;
    isPlaying: boolean;
    instrument: string;
    setInstrument: (v: string) => void;
    gmProgram: number | null;
    setGmProgram: (v: number) => void;
    exportWav: () => Promise<Blob | null>;
  };
};

export function Controls({ player }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const handleInstrumentChange = (v: string) => {
    if (v === "others") {
      setShowModal(true);
      return;
    }
    player.setInstrument(v);
  };

  const selectGM = (program: number) => {
    player.setGmProgram(program);
    player.setInstrument("gm");
    setShowModal(false);
  };

  const downloadWav = async () => {
    const blob = await player.exportWav();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.wav";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="controls">
      <button onClick={player.isPlaying ? player.stop : player.play}>
        {player.isPlaying ? "Stop" : "Play"}
      </button>

      <select
        value={player.instrument}
        onChange={(e) => handleInstrumentChange(e.target.value)}
      >
        <option value="synth">Synth</option>
        <option value="piano">Piano</option>
        <option value="violin">Violin</option>
        <option value="pad">Pad</option>
        <option value="chip">ChipTune</option>
        <option value="others">Others...</option>
      </select>

      <button onClick={downloadWav}>Export WAV</button>

      {showModal && (
        <div className="modal-bg">
          <div className="modal">
            <h2>Select GM Instrument</h2>
            <button className="close" onClick={() => setShowModal(false)}>
              ✕
            </button>

            {GM_CATEGORIES.map((cat, i) => (
              <div key={i} className="category">
                <div
                  className="category-title"
                  onClick={() =>
                    setExpandedCategory(expandedCategory === i ? null : i)
                  }
                >
                  {cat.name}
                </div>

                {expandedCategory === i && (
                  <div className="instrument-list">
                    {Array.from(
                      { length: cat.range[1] - cat.range[0] + 1 },
                      (_, idx) => {
                        const program = cat.range[0] + idx;
                        return (
                          <div
                            key={program}
                            className="instrument-item"
                            onClick={() => selectGM(program)}
                          >
                            {program}: GM Instrument
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
