import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useKyotoEngine } from './hooks/useKyotoEngine';
import { useWindowSize } from './hooks/useWindowSize';
import { HomeView } from './components/HomeView';
import { DetailView } from './components/DetailView';

export default function App() {
  const engine = useKyotoEngine();
  const { activeId, totalCount } = engine;
  const { width } = useWindowSize();
  const [cabinetWard,setCabinetWard]=useState('W_MINAMI');
  const [cabinetPreferences,setCabinetPreferences]=useState({night:true,paused:false});
  useEffect(()=>{document.documentElement.lang=engine.lang==='zh'?'zh-Hant':'ja';},[engine.lang]);

  return (
    <div className="flex justify-center h-full bg-[#050505]">
      <div className="w-full h-full bg-[#0c0b0a] text-[#f0ead6] relative overflow-hidden shadow-2xl urushi-panel border-x border-gold/20">
        <AnimatePresence mode="wait">
          {!activeId ? (
            <HomeView engine={engine} width={width} totalCount={totalCount}
              cabinetWard={cabinetWard} onCabinetWardChange={setCabinetWard}
              cabinetPreferences={cabinetPreferences} onCabinetPreferencesChange={setCabinetPreferences} />
          ) : (
            <DetailView engine={engine} width={width} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
