type EmptyStateProps = {
  title: string;
  body: string;
  action: string;
};

export default function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <h2 className="empty-title">{title}</h2>
      <p className="empty-body">{body}</p>
      <button type="button" className="btn" disabled>
        {action}
      </button>
    </div>
  );
}
