import { useState } from 'react';
import styles from './App.module.scss';
import RecordSection from './components/RecordSection';
import { ACTION, ACTION_LABELS } from './constants/wave.constants';
import type { ActionState } from './types/waves';

const DEFAULT_JOKE = 'Did you hear about the Italian chef that died? He pasta way.';

export default function App() {
  const [action] = useState<ActionState>(ACTION.WAITING);
  const [animate, setAnimate] = useState<boolean>(false);
  const [joke, setJoke] = useState<string>('');

  const handleRecordCLick = () => {
    setAnimate((prev) => !prev);
    setJoke(DEFAULT_JOKE);
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.title}>Voice-Activated Dad Joke Search Engine</div>
        <div className={styles.subtitle}>Press the button and ask for a joke!</div>
        <div className={styles.recordSection}>
          <RecordSection animate={animate} onClick={handleRecordCLick} />
        </div>

        <div className={styles.action}>
          <div className={styles.actionInfo}>{ACTION_LABELS[action]}...</div>
        </div>
      </div>
      {joke && (
        <div className={styles.cards}>
          <div className={styles.jokeCard}>{joke}</div>
        </div>
      )}
    </div>
  );
}
