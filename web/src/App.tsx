import { useState } from 'react';
import styles from './App.module.scss';
import RecordSection from './components/RecordSection';
import { ACTION, ACTION_LABELS } from './constants/wave.constants';
import type { ActionState } from './types/waves';
import { useRecorder } from './hooks/useRecorder';
import { transcribeAudio } from './lib/api';

// const DEFAULT_JOKE = 'Did you hear about the Italian chef that died? He pasta way.';

export default function App() {
  const [action] = useState<ActionState>(ACTION.WAITING);
  // const [animate, setAnimate] = useState<boolean>(false);
  const [joke] = useState<string>('');

  // const handleRecordCLick = () => {
  //   setAnimate((prev) => !prev);
  //   setJoke(DEFAULT_JOKE);
  // };

  const { recording, start, stop } = useRecorder();
  const [busy, setBusy] = useState(false);

  async function handlePress() {
    console.log('jfjgagkgr');
    console.log('recording', recording);
    try {
      if (!recording) {
        await start();
      } else {
        setBusy(true);
        const { blob, mime } = await stop();
        const text = await transcribeAudio(blob, mime || 'audio/webm');
        if (text) {
          console.log(text);
        }
      }
    } catch (e: unknown) {
      console.log(e);
    } finally {
      setBusy(false);
    }
  }

  // function onKey(e: React.KeyboardEvent<HTMLButtonElement>) {
  //   if (e.key === ' ' || e.key === 'Enter') {
  //     e.preventDefault();
  //     handlePress();
  //   }
  // }

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.title}>Voice-Activated Dad Joke Search Engine</div>
        <div className={styles.subtitle}>Press the button and ask for a joke!</div>
        <div className={styles.recordSection}>
          <RecordSection animate={busy} onClick={handlePress} />
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
