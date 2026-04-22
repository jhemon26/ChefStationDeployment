export default function TodoItem({ item, onToggle, onDelete }) {
  return (
    <div className="todo-item">
      <button type="button" className={`todo-check ${item.is_completed ? 'checked' : ''}`} onClick={() => onToggle(item)}>
        {item.is_completed ? <svg style={{ width: 12, height: 12 }}><use href="#ico-tick" /></svg> : null}
      </button>
      <div style={{ flex: 1 }}>
        <div>
          <div className={`todo-text ${item.is_completed ? 'checked' : ''}`}>
            {item.task_text}
          </div>
          <div className={`todo-priority ${item.priority}`}>{item.priority === 'high' ? 'High Priority' : item.priority}</div>
        </div>
      </div>
      <button type="button" className="btn btn-danger" onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  );
}
