import type { Activity } from '../utils/indexedDB';

type Props = {
  items: Activity[];
};

export default function ActivityList({ items }: Props) {
  if (!items || items.length === 0) {
    return <div>No hay actividades guardadas.</div>;
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
      {items.map((it) => (
        <li
          key={it.id}
          style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong>{it.title}</strong>
            <small style={{ color: '#666' }}>
              {new Date(it.createdAt).toLocaleString()}
            </small>
          </div>
          {it.description ? (
            <p style={{ margin: '8px 0 0' }}>{it.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
