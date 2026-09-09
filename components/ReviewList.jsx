export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-sm text-ink/50">Aucun avis pour le moment.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-line border-t border-line">
      {reviews.map((r) => (
        <div key={r.id} className="py-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-ink">{r.profiles?.full_name}</span>
            <span className="text-clay">{"★".repeat(r.rating)}</span>
          </div>
          <p className="text-sm text-ink/60">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
