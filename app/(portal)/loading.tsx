export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" style={{ display: 'grid', gap: 20 }}>
      <div className="skel" style={{ height: 200 }} />
      <div className="skel" style={{ height: 36, width: 240 }} />
      <div className="skel" style={{ height: 170 }} />
      <div className="g2">
        <div className="skel" style={{ height: 160 }} />
        <div className="skel" style={{ height: 160 }} />
      </div>
    </div>
  );
}
