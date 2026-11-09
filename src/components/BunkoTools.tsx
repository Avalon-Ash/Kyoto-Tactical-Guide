import { useReducedMotion } from 'motion/react';
import { Moon, Sun, Pause, Play } from 'lucide-react';
import type { Lang } from '../types';
import type { BunkoPreferences } from './BunkoEntrance';

/** Shared preferences for the entrance, catalogue and map. */
export function BunkoTools({ lang, preferences, onChange, onLanguage }: {
  lang: Lang;
  preferences: BunkoPreferences;
  onChange: (value: BunkoPreferences) => void;
  onLanguage: () => void;
}) {
  const systemReducedMotion = useReducedMotion();
  const themeLabel = lang === 'zh'
    ? (preferences.night ? '切換暖日' : '切換月光')
    : (preferences.night ? '陽光に切り替え' : '月光に切り替え');
  const motionLabel = lang === 'zh' ? '減少動態' : '動きを抑える';
  return <div className="bunko-tools">
    <button type="button" className="ui-button icon-button" aria-label={themeLabel} title={themeLabel}
      onClick={() => onChange({ ...preferences, night: !preferences.night })}>
      {preferences.night ? <Sun size={18} /> : <Moon size={18} />}
    </button>
    <button type="button" className="ui-button icon-button" aria-label={motionLabel} title={motionLabel}
      disabled={Boolean(systemReducedMotion)} aria-pressed={preferences.paused || Boolean(systemReducedMotion)} onClick={() => onChange({ ...preferences, paused: !preferences.paused })}>
      {preferences.paused ? <Play size={16} /> : <Pause size={16} />}
    </button>
    <button type="button" className="ui-button" onClick={onLanguage}
      aria-label={lang === 'zh' ? '切換日文' : '繁体字中国語に切り替え'}>{lang === 'zh' ? '日本語' : '繁中'}</button>
  </div>;
}
