'use client';

import { DocumentDTO } from '@shared/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, FileCode, FileText, Printer } from 'lucide-react';
import { useRef, useState } from 'react';

interface ExportButtonProps {
  readonly document: DocumentDTO;
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = globalThis.document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(/\s+/g, '-')
    .replaceAll(/[^a-z0-9-]/g, '')
    .substring(0, 60);
}

function exportAsTxt(doc: DocumentDTO): void {
  const content = `${doc.title}\n${'='.repeat(doc.title.length)}\n\n${doc.content}`;
  downloadFile(
    content,
    `${sanitizeFilename(doc.title)}.txt`,
    'text/plain;charset=utf-8'
  );
}

function exportAsPdf(doc: DocumentDTO): void {
  const updatedAt = format(new Date(doc.updatedAt), 'dd MMMM yyyy', {
    locale: fr,
  });

  // Convertit les sauts de ligne en paragraphes HTML
  const paragraphs = doc.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replaceAll('\n', '<br>')}</p>`)
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${doc.title}</title>
  <style>
    @page {
      margin: 2.5cm 2cm;
      size: A4;
    }
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #2c1a0e;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    .meta {
      font-family: Arial, sans-serif;
      font-size: 9pt;
      color: #888;
      border-bottom: 1px solid #ddd;
      padding-bottom: 0.6cm;
      margin-bottom: 1.2cm;
    }
    h1 {
      font-family: Georgia, serif;
      font-size: 22pt;
      font-weight: bold;
      color: #1a0a00;
      margin: 0 0 0.3cm 0;
      line-height: 1.2;
    }
    p {
      margin: 0 0 0.5em 0;
      text-align: justify;
      text-indent: 1.5em;
    }
    p:first-of-type { text-indent: 0; }
    @media print {
      body { -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="meta">
    <h1>${doc.title}</h1>
    Style : ${doc.style.name} &nbsp;·&nbsp; ${doc.wordCount} mots &nbsp;·&nbsp; Version ${doc.version} &nbsp;·&nbsp; ${updatedAt}
  </div>
  ${paragraphs}
</body>
</html>`;

  const printWindow = globalThis.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  // Laisser le temps au navigateur de charger le DOM avant d'imprimer
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
}

function exportAsMd(doc: DocumentDTO): void {
  const updatedAt = format(new Date(doc.updatedAt), 'dd MMMM yyyy', {
    locale: fr,
  });
  const content = [
    `# ${doc.title}`,
    '',
    `> **Style :** ${doc.style.name}  `,
    `> **Mots :** ${doc.wordCount}  `,
    `> **Version :** ${doc.version}  `,
    `> **Dernière modification :** ${updatedAt}`,
    '',
    '---',
    '',
    doc.content,
  ].join('\n');
  downloadFile(
    content,
    `${sanitizeFilename(doc.title)}.md`,
    'text/markdown;charset=utf-8'
  );
}

export function ExportButton({ document }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExport = (type: 'txt' | 'md' | 'pdf') => {
    if (type === 'txt') exportAsTxt(document);
    else if (type === 'md') exportAsMd(document);
    else exportAsPdf(document);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-interface flex items-center gap-2 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg hover:border-neutral-border/60 focus:outline-none focus:ring-2 focus:ring-neutral-border"
        title="Exporter le document"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Exporter</span>
      </button>

      {open && (
        <>
          {/* Overlay invisible pour fermer en cliquant à l'extérieur */}
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-lg border border-neutral-border bg-white shadow-lg">
            <button
              onClick={() => handleExport('pdf')}
              className="font-interface flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-textSecondary transition-colors hover:bg-neutral-bg hover:text-parchment-text"
            >
              <Printer size={15} />
              PDF (.pdf)
            </button>
            <div className="mx-3 border-t border-neutral-border/40" />
            <button
              onClick={() => handleExport('txt')}
              className="font-interface flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-textSecondary transition-colors hover:bg-neutral-bg hover:text-parchment-text"
            >
              <FileText size={15} />
              Texte brut (.txt)
            </button>
            <button
              onClick={() => handleExport('md')}
              className="font-interface flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-textSecondary transition-colors hover:bg-neutral-bg hover:text-parchment-text"
            >
              <FileCode size={15} />
              Markdown (.md)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
