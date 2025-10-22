export const ACTION = {
    LOADING: "loading",
    TRANSCRIBING: "transcribing",
    WAITING: "waiting-for-you",
    ERROR: "error",
  } as const;
  
  export const ACTION_LABELS = {
    loading: "Loading…",
    transcribing: "Transcribing…",
    "waiting-for-you": "Waiting for you",
    error: "Something went wrong",
  } as const;
  