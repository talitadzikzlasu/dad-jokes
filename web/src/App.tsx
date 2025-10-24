import { useState } from 'react';
import styles from './App.module.scss';
import RecordSection from './components/RecordSection';
import { ACTION, ACTION_LABELS } from './constants/wave.constants';
import type { ActionState } from './types/waves';
import { useRecorder } from './hooks/useRecorder';
import { searchJokesMulti, transcribeAudio } from './lib/api';
import { filterCommonWords, topKeywordsCompromise } from './lib/keywords';

export default function App() {
  const [action, setAction] = useState<ActionState>(ACTION.WAITING);
  const [animate, setAnimate] = useState<boolean>(false);
  const [jokes, setJokes] = useState<{ id: string; joke: string; length: number }[]>([]);
  const [joke, setJoke] = useState<{ id: string; joke: string; length: number }>();

  const { recording, start, stop } = useRecorder();
  const [busy, setBusy] = useState(false);

  function handleChangeJoke() {
    if (!jokes || jokes.length === 0 || !joke) {
      return;
    }

    const currentIndex = jokes.findIndex((j) => j.id === joke.id);

    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % jokes.length;

    const next = jokes[nextIndex];

    setJoke(next);
  }

  function pickFirstDifferent(
    newList: { id: string; joke: string; length: number }[],
    prev?: { id: string; joke: string; length: number }
  ) {
    if (!newList || newList.length === 0) {
      return undefined;
    }

    if (!prev) {
      return newList[0];
    }

    const different = newList.find((j) => j.id !== prev.id);

    if (different) {
      return different;
    }

    return newList[0];
  }

  async function handlePress() {
    console.log('recording', recording);
    try {
      if (!recording) {
        await start();
        setAnimate(true);
        setAction(ACTION.RECORDING);
      } else {
        setBusy(true);
        setAnimate(false);
        const { blob, mime } = await stop();
        setAction(ACTION.TRANSCRIBING);
        const text = await transcribeAudio(blob, mime || 'audio/webm');
        if (text) {
          setAction(ACTION.LOADING);
          const keywords = topKeywordsCompromise(text);
          const clean = filterCommonWords(keywords, ['good', 'tape']);
          const jokes = await searchJokesMulti(clean);
          setAction(ACTION.READY);
          setJokes(jokes);
          const nextJoke = pickFirstDifferent(jokes, joke);
          setJoke(nextJoke);
          console.log('key', joke);
        } else {
          setAction(ACTION.AGAIN);
          setBusy(false);
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
          <RecordSection
            recording={action === ACTION.RECORDING}
            busy={action !== ACTION.READY && action !== ACTION.WAITING}
            animate={animate && action !== ACTION.AGAIN}
            onClick={handlePress}
            disabled={busy}
          />
        </div>

        <div className={styles.action}>
          <div className={styles.actionInfo}>{ACTION_LABELS[action]}...</div>
        </div>
      </div>
      {joke && (
        <div className={styles.cards}>
          <div className={styles.jokeCard}>{joke.joke}</div>
          {jokes.length > 1 && <button onClick={handleChangeJoke}> give me a different one</button>}
        </div>
      )}
    </div>
  );
}
