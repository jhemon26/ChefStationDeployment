import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import PrepTaskRow from '../components/PrepTaskRow';
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
      <div className="card">
        <div className="table-scroll">
          <table className="list-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Task</th>
                <th>Notes</th>
                <th>Quantity</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Sort</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <PrepTaskRow
                  key={task.id}
                  task={task}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === tasks.length - 1}
                  onStatus={(current) => updatePrepTask(current.id, { status: current.status === 'done' ? 'pending' : 'done' }).then(load)}
                  onPriority={(current) => updatePrepTask(current.id, { priority: nextPriority[current.priority] }).then(load)}
                  onMoveUp={() => swapWithNeighbor(index, -1)}
                  onMoveDown={() => swapWithNeighbor(index, 1)}
                  onDelete={(id) => deletePrepTask(id).then(load)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
