import { useGameStore } from '../state/gameStore';
import styles from './EventFeed.module.css';

export const EventFeed = () => {
  const events = useGameStore((state) => state.events);

  return (
    <section className={styles.feed}>
      <h2>Telemetry</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
            <p>{event.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};
