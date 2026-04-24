import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { createTodo, deleteTodo, listTodos, updateTodo } from '../services/todoService';
import { toLocalDateString } from '../utils/date';
import { confirmAction } from '../utils/confirmAction';

const today = toLocalDateString();
const nextPriority = { low: 'medium', medium: 'high', high: 'low' };

export default function TodoPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ task_text: '', notes: '', priority: 'medium' });

  const load = async () => {
    const { data } = await listTodos(today);
    setItems(data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return (
    <AppShell>
      <PageHeader title="Tomorrow's To-Do" subtitle="Plan sequence, notes, status, and priority" />
      <form className="card inline-grid two" onSubmit={(e) => {
        e.preventDefault();
        createTodo({ ...form, date: today }).then(() => {
          setForm({ task_text: '', notes: '', priority: 'medium' });
          load();
        });
      }}>
        <input placeholder="Task text" value={form.task_text} onChange={(e) => setForm({ ...form, task_text: e.target.value })} />
        <input placeholder="Notes / details" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button className="btn btn-primary" type="submit">Add Todo</button>
      </form>
      <div style={{ height: 16 }} />
      <div className="control-list">
        {items.map((item, index) => (
          <div key={item.id} className={`control-card control-card-task ${item.is_completed ? 'is-complete' : ''}`}>
            <div className="control-card-head">
              <div>
                <div className="helper-text">Todo {index + 1}</div>
                <div className="control-card-title control-card-title-completable">{item.task_text}</div>
              </div>
              <div className="control-card-actions">
                <button
                  type="button"
                  className="btn btn-ghost sort-btn"
                  disabled={index === 0}
                  onClick={() =>
                    Promise.all([
                      updateTodo(item.id, { sort_order: items[index - 1].sort_order }),
                      updateTodo(items[index - 1].id, { sort_order: item.sort_order }),
                    ]).then(load)
                  }
                >
                  Up
                </button>
                <button
                  type="button"
                  className="btn btn-ghost sort-btn"
                  disabled={index === items.length - 1}
                  onClick={() =>
                    Promise.all([
                      updateTodo(item.id, { sort_order: items[index + 1].sort_order }),
                      updateTodo(items[index + 1].id, { sort_order: item.sort_order }),
                    ]).then(load)
                  }
                >
                  Down
                </button>
              </div>
            </div>
            <div className="control-card-grid">
              <div>
                <div className="helper-text">Notes</div>
                <div className="control-card-copy-completable">{item.notes || '—'}</div>
              </div>
            </div>
            {item.is_completed ? (
              <div className="control-card-completed-by">
                Completed by {item.completed_by_name || 'a team member'}
              </div>
            ) : null}
            <div className="control-card-footer">
              <button
                type="button"
                className={`prep-status ${item.is_completed ? 'done' : 'pending'}`}
                onClick={() => updateTodo(item.id, { is_completed: !item.is_completed }).then(load)}
              >
                {item.is_completed ? 'Complete' : 'Pending'}
              </button>
              <button
                type="button"
                className={`prep-priority ${item.priority === 'high' ? 'urgent' : item.priority}`}
                onClick={() => updateTodo(item.id, { priority: nextPriority[item.priority] }).then(load)}
              >
                {item.priority}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  if (!(await confirmAction(`Delete "${item.task_text}"?`, { confirmLabel: 'Delete Todo' }))) return;
                  deleteTodo(item.id).then(load);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
