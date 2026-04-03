import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <p className="text-[var(--text-quaternary)] text-[13px] italic">
        Nothing to preview
      </p>
    );
  }

  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-[22px] font-bold mb-4 mt-7 first:mt-0 text-[var(--text-primary)] tracking-[-0.3px]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[18px] font-semibold mb-3 mt-6 text-[var(--text-primary)] tracking-[-0.2px]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[15px] font-semibold mb-2 mt-5 text-[var(--text-primary)]">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-[1.75] text-[13.5px] text-[var(--text-primary)]">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 text-[13.5px] text-[var(--text-primary)] space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 text-[13.5px] text-[var(--text-primary)] space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-[1.7]">{children}</li>
          ),
          code: ({ className, children }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre className="bg-[var(--hover-bg)] rounded-[var(--radius-md)] p-4 mb-3 overflow-x-auto border border-[var(--border-light)]">
                  <code className="text-[12px] font-mono text-[var(--text-primary)] leading-[1.6]" style={{ fontFamily: "var(--font-mono)" }}>
                    {children}
                  </code>
                </pre>
              );
            }
            return (
              <code
                className="bg-[var(--accent-soft)] text-[var(--accent)] px-1.5 py-[1px] rounded-[4px] text-[12px] font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-[3px] border-[var(--accent)] pl-4 mb-3 text-[var(--text-secondary)] italic bg-[var(--accent-soft)] rounded-r-[var(--radius-sm)] py-2 pr-3">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[var(--accent)] hover:text-[var(--accent-hover)] underline underline-offset-2 decoration-[var(--accent)]/30 hover:decoration-[var(--accent)] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="border-[var(--border-light)] my-8" />,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3 border border-[var(--border-light)] rounded-[var(--radius-md)]">
              <table className="w-full text-[13px] border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-[var(--border-light)] px-3 py-2 bg-[var(--hover-bg)] text-left font-semibold text-[12px] text-[var(--text-secondary)] uppercase tracking-wide">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[var(--border-light)] px-3 py-2 text-[var(--text-primary)]">
              {children}
            </td>
          ),
          input: ({ checked, ...props }) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 accent-[var(--accent)] rounded"
              {...props}
            />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-[var(--text-secondary)]">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
