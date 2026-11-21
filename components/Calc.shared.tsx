// Small helpers used by the fee calculator.
export const Line = ({ label, value }: { label: string; value: string }) => (
  <div className="line">
    <span className="muted">{label}</span>
    <strong>{value}</strong>
  </div>
);
