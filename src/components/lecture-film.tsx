export function LectureFilm({ id, title }: { id: string; title: string }) {
  return (
    <figure className="border border-border bg-bg">
      <video
        className="aspect-video w-full bg-bg"
        controls
        playsInline
        preload="metadata"
        src={`/lectures/${id}.mp4`}
        aria-label={`Sitting film: ${title}`}
      />
      <figcaption className="border-t border-border px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted">
        Sitting film · {title}
      </figcaption>
    </figure>
  );
}
