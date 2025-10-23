import Wave from './Wave';
import styles from './RecordSection.module.scss';

type Props = {
  animate?: boolean;
  disabled?: boolean;
  recording: boolean;
  busy: boolean;
  onClick?: () => void;
};

export default function RecordSection({
  recording,
  busy,
  disabled = false,
  animate = false,
  onClick,
}: Props) {
  return (
    <div className={styles.wrap}>
      <Wave animate={animate} width={568.71} height={108} />
      <button
        disabled={disabled}
        onClick={onClick}
        className={[styles.fab, recording ? styles.recording : '', disabled ? styles.disabled : '']
          .join(' ')
          .trim()}
        aria-label="Action"
      >
        {recording && <StopIcon />}
        {!recording && !busy && (
          <img
            src="/img/microphone.svg"
            alt="microphone icon"
            width="100"
            className={styles.microphone}
          />
        )}
        {busy && !recording && <SpinnerIcon></SpinnerIcon>}
      </button>
    </div>
  );
}

function StopIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="2" />
    </svg>
  );
}

function SpinnerIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      className={styles.spinner}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path d="M21 12a9 9 0 0 1-9 9" fill="none" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
