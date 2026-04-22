export default function CounterButton({ children, ...props }) {
  return (
    <button type="button" className="icon-btn" {...props}>
      {children}
    </button>
  );
}
