export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-sm text-gray-500">Aucun avis pour le moment.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-lg border border-gray-200 p-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-medium">{r.profiles?.full_name}</span>
            <span className="text-brand">{"★".repeat(r.rating)}</span>
          </div>
          <p className="text-sm text-gray-600">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
