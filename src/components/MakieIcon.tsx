import { makieIcon, type MakieMotif } from '../lib/makie-icons';

export function MakieIcon({ motif }: { motif: MakieMotif }) {
  return <span className="hira-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: makieIcon(motif) }} />;
}
