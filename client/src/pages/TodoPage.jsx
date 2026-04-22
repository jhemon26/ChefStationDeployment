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
      <div className="card">
        <div className="table-scroll">
          <table className="list-table">
            <thead>
              <tr><th>Order</th><th>Task</th><th>Notes</th><th>Status</th><th>Priority</th><th>Sort</th><th>Action</th></tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={item.is_completed ? 'todo-row-complete' : ''}>
                  <td>{index + 1}</td>
                  <td>{item.task_text}</td>
                  <td>{item.notes || '—'}</td>
                  <td>
                    <button
                      type="button"
                      className={`prep-status ${item.is_completed ? 'done' : 'pending'}`}
                      style={{ background: 'transparent', border: 'none' }}
                      onClick={() => updateTodo(item.id, { is_completed: !item.is_completed }).then(load)}
                    >
                      {item.is_completed ? 'Complete' : 'Pending'}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`prep-priority ${item.priority === 'high' ? 'urgent' : item.priority}`}
                      style={{ background: 'transparent', border: 'none' }}
                      onClick={() => updateTodo(item.id, { priority: nextPriority[item.priority] }).then(load)}
                    >
                      {item.priority}
                    </button>
                  </td>
                  <td>
                    <div className="sort-controls">
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
                  </td>
                  <td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
