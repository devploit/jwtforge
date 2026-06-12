import { CopyButton } from "./CopyButton";

export function CodeBlock({
  code,
  title,
  language,
}: {
  code: string;
  title?: string;
  language?: string;
}) {
  return (
    <div className="panel overflow-hidden">
      {(title || language) && (
        <div className="flex items-center justify-between border-b border-line bg-bg-inset px-3 py-1.5">
          <span className="font-mono text-xs text-slate-400">
            {title}
            {language ? (
              <span className="ml-2 text-slate-600">{language}</span>
            ) : null}
          </span>
          <CopyButton text={code} />
        </div>
      )}
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
