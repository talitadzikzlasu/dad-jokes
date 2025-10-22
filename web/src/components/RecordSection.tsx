import Wave from './Wave';
import styles from './RecordSection.module.scss';

type Props = {
  animate?: boolean;
  onClick?: () => void;
};

export default function RecordSection({ animate = true, onClick }: Props) {
  return (
    <div className={styles.wrap}>
      <Wave animate={animate} width={568.71} height={108} />
      <button className={styles.fab} onClick={onClick} aria-label="Action">
        <img
          src="/img/microphone.svg"
          alt="microphone icon"
          width="100"
          className={styles.microphone}
        />
      </button>
    </div>
  );
}
