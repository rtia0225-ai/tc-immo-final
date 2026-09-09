export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-sm text-gray-500">Aucun avis pour le moment.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-xl bg-gray-50 p-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-bold text-ink">{r.profiles?.full_name}</span>
            <span className="text-gold">{"★".repeat(r.rating)}</span>
          </div>
          <p className="text-sm text-gray-600">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
