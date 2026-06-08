import { WordEntry } from '../types';

export function extractAudioUrl(entries: WordEntry[]): string | null {
  for (const entry of entries) {
    for (const phonetic of entry.phonetics ?? []) {
      if (phonetic.audio && phonetic.audio.trim().length > 0) {
        return phonetic.audio.trim();
      }
    }
  }
  return null;
}

export function extractPhoneticText(entries: WordEntry[]): string | null {
  for (const entry of entries) {
    // Some entries have a top-level phonetic field
    for (const phonetic of entry.phonetics ?? []) {
      if (phonetic.text && phonetic.text.trim().length > 0) {
        return phonetic.text.trim();
      }
    }
  }
  return null;
}

export function extractAllAudioUrls(entries: WordEntry[]): string[] {
  const urls: string[] = [];
  for (const entry of entries) {
    for (const phonetic of entry.phonetics ?? []) {
      if (phonetic.audio && phonetic.audio.trim().length > 0) {
        const url = phonetic.audio.trim();
        if (!urls.includes(url)) {
          urls.push(url);
        }
      }
    }
  }
  return urls;
}

// Returns every unique audio URL paired with its phonetic text.
// Used by WordCard to render one AudioPlayer per available pronunciation.
export function extractAllPhonetics(
  entries: WordEntry[],
): Array<{ text: string | null; audio: string }> {
  const seen = new Set<string>();
  const result: Array<{ text: string | null; audio: string }> = [];
  for (const entry of entries) {
    for (const phonetic of entry.phonetics ?? []) {
      const audio = phonetic.audio?.trim();
      if (audio && audio.length > 0 && !seen.has(audio)) {
        seen.add(audio);
        result.push({ text: phonetic.text?.trim() || null, audio });
      }
    }
  }
  return result;
}

export function dedupeStrings(arr: string[]): string[] {
  const seen = new Set<string>();
  return arr.filter((s) => {
    const lower = s.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

export function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  if (minutes >= 1) return `${minutes}m ago`;
  return 'Just now';
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
