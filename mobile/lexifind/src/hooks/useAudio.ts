// Backward-compatible wrapper around the global AudioContext.
// New code should import useAudioContext directly.
export type { AudioStatus } from '../context/AudioContext';
export { useAudioContext as useAudio } from '../context/AudioContext';
