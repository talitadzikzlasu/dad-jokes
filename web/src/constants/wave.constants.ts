export const ACTION = {
  LOADING: 'loading',
  TRANSCRIBING: 'transcribing',
  WAITING: 'waiting-for-you',
  ERROR: 'error',
  READY: 'ready',
  RECORDING: 'recording',
} as const;

export const ACTION_LABELS = {
  loading: 'Loading…',
  transcribing: 'Transcribing…',
  'waiting-for-you': 'Waiting for you',
  error: 'Something went wrong',
  ready: '',
  recording: 'recording',
} as const;
