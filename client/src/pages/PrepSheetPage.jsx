import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { createPrepTask, deletePrepTask, listPrepTasks, updatePrepTask } from '../services/prepService';
import { toLocalDateString } from '../utils/date';

const today = toLocalDateString();
const nextPriority = { urgent: 'medium', medium: 'low', low: 'urgent' };

export default function PrepSheetPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ task_name: '', notes: '', quantity: '', unit: '', assigned_to: '', priority: 'medium' });

  const load = async () => {
    const { data } = await listPrepTasks(today);
    setTasks(data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await createPrepTask({ ...form, date: today });
    setForm({ task_name: '', notes: '', quantity: '', unit: '', assigned_to: '', priority: 'medium' });
    load();
  };

  const swapWithNeighbor = async (index, direction) => {
    const neighborIndex = index + direction;
    if (neighborIndex < 0 || neighborIndex >= tasks.length) return;
    const current = tasks[index];
    const neighbor = tasks[neighborIndex];
    await Promise.all([
      updatePrepTask(current.id, { sort_order: neighbor.sort_order }),
      updatePrepTask(neighbor.id, { sort_order: current.sort_order }),
    ]);
    load();
  };

  return (
    <AppShell>
      <PageHeader title="Prep Sheet" subtitle="Task status, priority, and order tracking" />
      <form className="card inline-grid two" onSubmit={submit}>
        <input placeholder="Task" value={form.task_name} onChange={(e) => setForm({ ...form, task_name: e.target.value })} />
        <input placeholder="Notes / details" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <input placeholder="Assigned To" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
        <input placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        <input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option value="urgent">Urgent</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button className="btn btn-primary" type="submit">Add Task</button>
      </form>
      <div style={{ height: 16 }} />
      <div className="control-list">
        {tasks.map((task, index) => (
          <div key={task.id} className={`control-card control-card-task ${task.status === 'done' ? 'is-complete' : ''}`}>
            <div className="control-card-head">
              <div>
                <div className="helper-text">Task {index + 1}</div>
                <div className="control-card-title control-card-title-completable">{task.task_name}</div>
              </div>
              <div className="control-card-actions">
                <button className="btn btn-ghost sort-btn" type="button" disabled={index === 0} onClick={() => swapWithNeighbor(index, -1)}>Up</button>
                <button className="btn btn-ghost sort-btn" type="button" disabled={index === tasks.length - 1} onClick={() => swapWithNeighbor(index, 1)}>Down</button>
              </div>
            </div>
            <div className="control-card-grid">
              <div>
                <div className="helper-text">Notes</div>
                <div className="control-card-copy-completable">{task.notes || '—'}</div>
              </div>
              <div>
                <div className="helper-text">Quantity</div>
                <div className="control-card-copy-completable">{[task.quantity, task.unit].filter(Boolean).join(' ') || '—'}</div>
              </div>
              <div>
                <div className="helper-text">Assigned To</div>
                <div className="control-card-copy-completable">{task.assigned_to || '—'}</div>
              </div>
            </div>
            {task.status === 'done' ? (
              <div className="control-card-completed-by">
                Completed by {task.completed_by_name || 'a team member'}
              </div>
            ) : null}
            <div className="control-card-footer">
              <button type="button" className={`prep-status ${task.status}`} onClick={() => updatePrepTask(task.id, { status: task.status === 'done' ? 'pending' : 'done' }).then(load)}>
                {task.status}
              </button>
              <button type="button" className={`prep-priority ${task.priority}`} onClick={() => updatePrepTask(task.id, { priority: nextPriority[task.priority] }).then(load)}>
                {task.priority}
              </button>
              <button type="button" className="btn btn-danger" onClick={() => deletePrepTask(task.id).then(load)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
