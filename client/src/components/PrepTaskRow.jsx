import { confirmAction } from '../utils/confirmAction';

export default function PrepTaskRow({ task, index, isFirst, isLast, onStatus, onPriority, onMoveUp, onMoveDown, onDelete }) {
  return (
    <tr className={task.status === 'done' ? 'todo-row-complete' : ''}>
      <td>{typeof index === 'number' ? index + 1 : '—'}</td>
      <td>{task.task_name}</td>
      <td>{task.notes || '—'}</td>
      <td>{[task.quantity, task.unit].filter(Boolean).join(' ') || 'N/A'}</td>
      <td>{task.assigned_to || 'Unassigned'}</td>
      <td>
        <button type="button" className={`prep-status ${task.status}`} onClick={() => onStatus(task)} style={{ background: 'transparent', border: 'none' }}>
          {task.status}
        </button>
      </td>
      <td>
        <button type="button" className={`prep-priority ${task.priority}`} onClick={() => onPriority(task)} style={{ background: 'transparent', border: 'none' }}>
          {task.priority}
        </button>
      </td>
      <td>
        <div className="sort-controls">
          <button type="button" className="btn btn-ghost sort-btn" disabled={isFirst} onClick={onMoveUp}>Up</button>
          <button type="button" className="btn btn-ghost sort-btn" disabled={isLast} onClick={onMoveDown}>Down</button>
        </div>
      </td>
      <td>
        <button type="button" className="btn btn-danger" onClick={async () => {
          if (!(await confirmAction(`Delete "${task.task_name}"?`, { confirmLabel: 'Delete Task' }))) return;
          onDelete(task.id);
        }}>Delete</button>
      </td>
    </tr>
  );
}
