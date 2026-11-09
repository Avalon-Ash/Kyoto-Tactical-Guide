import { useReducedMotion } from 'motion/react';
import { Moon, Sun, Pause, Play } from 'lucide-react';
import type { Lang } from '../types';
import type { BunkoPreferences } from './BunkoEntrance';
import { translate } from '../data/i18n';

/** Shared preferences for the entrance, catalogue and map. */
export function BunkoTools({ lang, preferences, onChange, onLanguage }: {
  lang: Lang;
  preferences: BunkoPreferences;
  onChange: (value: BunkoPreferences) => void;
  onLanguage: () => void;
}) {
  const systemReducedMotion = Boolean(useReducedMotion());
  const themeLabel = translate(preferences.night ? 'theme_to_day' : 'theme_to_night', lang);
  const motionLabel = translate('motion_reduce', lang);
  return <div className="bunko-tools">
    <button type="button" className="ui-button icon-button" aria-label={themeLabel} title={themeLabel}
      onClick={() => onChange({ ...preferences, night: !preferences.night })}>
      {preferences.night ? <Sun size={18} /> : <Moon size={18} />}
    </button>
    <button type="button" className="ui-button icon-button" aria-label={motionLabel} title={motionLabel}
      disabled={systemReducedMotion} aria-pressed={preferences.paused || systemReducedMotion}
      onClick={() => onChange({ ...preferences, paused: !preferences.paused })}>
      {preferences.paused ? <Play size={16} /> : <Pause size={16} />}
    </button>
    <button type="button" className="ui-button" onClick={onLanguage}
      aria-label={translate('lang_switch_label', lang)}>{translate('lang_switch', lang)}</button>
  </div>;
}
