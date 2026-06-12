import { CopyButton } from "./CopyButton";
import { DownloadButton } from "./DownloadButton";

export function CodeBlock({
  code,
  title,
  language,
  filename,
}: {
  code: string;
  title?: string;
  language?: string;
  /** When set, shows a download button that saves the code to this file. */
  filename?: string;
}) {
  return (
    <div className="panel overflow-hidden">
      {(title || language) && (
        <div className="flex items-center justify-between border-b border-line bg-bg-inset/80 px-3 py-2">
          <span className="font-mono text-xs text-slate-400">
            {title}
            {language ? (
              <span className="ml-2 text-slate-600">{language}</span>
            ) : null}
          </span>
          <div className="flex items-center gap-1.5">
            {filename && <DownloadButton text={code} filename={filename} />}
            <CopyButton text={code} />
          </div>
        </div>
      )}
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
