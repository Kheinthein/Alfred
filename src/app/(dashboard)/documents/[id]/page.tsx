'use client';

import { DocumentEditor } from '@components/DocumentEditor';
import { ExportButton } from '@components/ExportButton';
import { documentService } from '@shared/services/documentService';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function DocumentDetailPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const documentId = params.id;

  const { data: document, isLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => documentService.getById(documentId),
    enabled: Boolean(documentId),
  });

  if (isLoading || !document) {
    return (
      <p className="font-writing text-neutral-textSecondary">
        Chargement du document...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/documents"
          className="font-interface text-sm font-medium text-action-link transition-colors hover:underline"
        >
          ← Retour aux documents
        </Link>
        <ExportButton document={document} />
      </div>

      <DocumentEditor document={document} />
    </div>
  );
}
