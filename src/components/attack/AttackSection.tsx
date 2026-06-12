export function AttackSection({
  id,
  title,
  severity,
  description,
  children,
}: {
  id: string;
  title: string;
  severity?: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="panel scroll-mt-24 p-4">
      <h2 className="text-base font-semibold text-slate-100">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
