import styles from './App.module.scss';
import Wave from './components/Wave';

export default function App() {
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.title}>Voice-Activated Dad Joke Search Engine</div>
        <div className={styles.subtitle}>Press the button and ask for a joke!</div>
        <div className={styles.recordSection}>
          <Wave />
        </div>

        <div className={styles.action}></div>
      </div>
      <div className={styles.cards}>cards</div>
    </div>
  );
}
