'use client';

import { BookWithChaptersDTO, DocumentDTO } from '@shared/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, FileCode, FileText, Printer } from 'lucide-react';
import { useState } from 'react';

interface BookExportButtonProps {
  readonly book: BookWithChaptersDTO;
  readonly chapters: DocumentDTO[];
}

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(/\s+/g, '-')
    .replaceAll(/[^a-z0-9-]/g, '')
    .substring(0, 60);
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

function exportBookAsTxt(
  book: BookWithChaptersDTO,
  chapters: DocumentDTO[]
): void {
  const lines: string[] = [book.title, '='.repeat(book.title.length), ''];
  if (book.description) {
    lines.push(book.description, '', '');
  }

  for (const chapter of chapters) {
    lines.push(
      chapter.title,
      '-'.repeat(chapter.title.length),
      '',
      chapter.content,
      '',
      ''
    );
  }

  downloadFile(
    lines.join('\n'),
    `${sanitizeFilename(book.title)}.txt`,
    'text/plain;charset=utf-8'
  );
}

function exportBookAsMd(
  book: BookWithChaptersDTO,
  chapters: DocumentDTO[]
): void {
  const updatedAt = format(new Date(book.updatedAt), 'dd MMMM yyyy', {
    locale: fr,
  });
  const lines: string[] = [`# ${book.title}`, ''];
  if (book.description) {
    lines.push(`*${book.description}*`, '');
  }
  lines.push(
    `> ${chapters.length} chapitre${chapters.length > 1 ? 's' : ''} &nbsp;·&nbsp; ${chapters.reduce((acc, c) => acc + c.wordCount, 0)} mots &nbsp;·&nbsp; ${updatedAt}`,
    '',
    '---',
    ''
  );

  chapters.forEach((chapter, i) => {
    lines.push(`## ${i + 1}. ${chapter.title}`, '', chapter.content, '', '');
  });

  downloadFile(
    lines.join('\n'),
    `${sanitizeFilename(book.title)}.md`,
    'text/markdown;charset=utf-8'
  );
}

function exportBookAsPdf(
  book: BookWithChaptersDTO,
  chapters: DocumentDTO[]
): void {
  const updatedAt = format(new Date(book.updatedAt), 'dd MMMM yyyy', {
    locale: fr,
  });
  const totalWords = chapters.reduce((acc, c) => acc + c.wordCount, 0);

  const tocItems = chapters
    .map(
      (chapter, i) => `
    <li class="toc-item">
      <a href="#chapter-${i + 1}">
        <span class="toc-num">Chapitre ${i + 1}</span>
        <span class="toc-title">${chapter.title}</span>
        <span class="toc-dots"></span>
        <span class="toc-page"></span>
      </a>
    </li>`
    )
    .join('\n');

  const chaptersHtml = chapters
    .map((chapter, i) => {
      const paragraphs = chapter.content
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${p.replaceAll('\n', '<br>')}</p>`)
        .join('\n');

      return `
    <div class="chapter" id="chapter-${i + 1}">
      <h2><span class="chapter-num">Chapitre ${i + 1}</span>${chapter.title}</h2>
      ${paragraphs}
    </div>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${book.title}</title>
  <style>
    @page {
      margin: 2.5cm 2cm 3cm 2cm;
      size: A4;

      @bottom-center {
        content: counter(page);
        font-family: Georgia, serif;
        font-size: 9pt;
        color: #a07840;
      }
    }

    /* Pas de numéro sur la couverture ni le sommaire */
    @page cover-page  { @bottom-center { content: none; } }
    @page toc-page   { @bottom-center { content: none; } }

    * { box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #2c1a0e;
      background: #fff;
      margin: 0;
      padding: 0;
      counter-reset: page 0;
    }

    /* ── Couverture ── */
    .cover {
      page: cover-page;
      page-break-after: always;
      text-align: center;
      padding: 4cm 1cm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 24cm;
    }
    .cover-rule {
      width: 6cm;
      border: none;
      border-top: 2px solid #c8a97e;
      margin: 0.6cm auto;
    }
    .cover h1 {
      font-size: 28pt;
      font-weight: bold;
      color: #1a0a00;
      margin: 0 0 0.3cm 0;
      line-height: 1.2;
    }
    .cover .description {
      font-style: italic;
      font-size: 13pt;
      color: #7a5c3a;
      margin: 0.3cm 0 0 0;
    }
    .cover .meta {
      font-family: Arial, sans-serif;
      font-size: 9pt;
      color: #aaa;
      margin-top: 1.5cm;
    }

    /* ── Sommaire ── */
    .toc {
      page: toc-page;
      page-break-after: always;
      padding-top: 1cm;
    }
    .toc-title {
      font-size: 16pt;
      font-weight: bold;
      color: #1a0a00;
      border-bottom: 1px solid #c8a97e;
      padding-bottom: 0.3cm;
      margin-bottom: 0.8cm;
    }
    .toc ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .toc-item {
      margin-bottom: 0.35cm;
    }
    .toc-item a {
      display: flex;
      align-items: baseline;
      gap: 0.3em;
      text-decoration: none;
      color: #2c1a0e;
      font-size: 11pt;
    }
    .toc-item .toc-num {
      font-family: Arial, sans-serif;
      font-size: 8pt;
      color: #a07840;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      white-space: nowrap;
      flex-shrink: 0;
      margin-right: 0.4em;
    }
    .toc-item .toc-title {
      font-size: 11pt;
      border: none;
      padding: 0;
      margin: 0;
      color: #2c1a0e;
      flex-shrink: 1;
    }
    .toc-item .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #c8a97e;
      margin: 0 0.4em 0.2em 0.4em;
    }
    .toc-item .toc-page::after {
      content: target-counter(attr(href), page);
      font-family: Georgia, serif;
      font-size: 10pt;
      color: #a07840;
    }

    /* ── Chapitres ── */
    .chapter {
      page-break-before: always;
    }
    h2 {
      font-size: 16pt;
      font-weight: bold;
      color: #1a0a00;
      margin: 0 0 0.8cm 0;
      border-bottom: 1px solid #c8a97e;
      padding-bottom: 0.3cm;
    }
    .chapter-num {
      display: block;
      font-family: Arial, sans-serif;
      font-size: 9pt;
      font-weight: normal;
      color: #a07840;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.2cm;
    }
    p {
      margin: 0 0 0.5em 0;
      text-align: justify;
      text-indent: 1.5em;
    }
    p:first-of-type { text-indent: 0; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- Couverture -->
  <div class="cover">
    <h1>${book.title}</h1>
    <hr class="cover-rule">
    ${book.description ? `<p class="description">${book.description}</p>` : ''}
    <p class="meta">${chapters.length} chapitre${chapters.length > 1 ? 's' : ''} &nbsp;·&nbsp; ${totalWords} mots &nbsp;·&nbsp; ${updatedAt}</p>
  </div>

  <!-- Sommaire -->
  <div class="toc">
    <p class="toc-title">Sommaire</p>
    <ul>${tocItems}</ul>
  </div>

  <!-- Chapitres -->
  ${chaptersHtml}

</body>
</html>`;

  const printWindow = globalThis.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

export function BookExportButton({ book, chapters }: BookExportButtonProps) {
  const [open, setOpen] = useState(false);

  if (chapters.length === 0) return null;

  const handleExport = (type: 'txt' | 'md' | 'pdf') => {
    if (type === 'txt') exportBookAsTxt(book, chapters);
    else if (type === 'md') exportBookAsMd(book, chapters);
    else exportBookAsPdf(book, chapters);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-interface flex items-center gap-2 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg hover:border-neutral-border/60 focus:outline-none focus:ring-2 focus:ring-neutral-border"
        title="Exporter le livre complet"
      >
        <Download size={16} />
        <span>Exporter le livre</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-lg border border-neutral-border bg-white shadow-lg">
            <div className="px-4 py-2 border-b border-neutral-border/40">
              <p className="font-interface text-xs text-neutral-textSecondary/70">
                {chapters.length} chapitre{chapters.length > 1 ? 's' : ''} ·{' '}
                {chapters.reduce((a, c) => a + c.wordCount, 0)} mots
              </p>
            </div>
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
