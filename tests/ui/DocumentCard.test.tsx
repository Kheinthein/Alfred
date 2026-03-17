import { DocumentCard } from '@components/DocumentCard';
import { fireEvent, screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const documentMock = {
  id: 'doc-1',
  title: 'Mon roman',
  content: 'Lorem ipsum dolor sit amet',
  wordCount: 5,
  style: { id: 'style-1', name: 'Roman', description: 'desc' },
  version: 2,
  sortOrder: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('DocumentCard', () => {
  it('affiche les informations principales du document', () => {
    render(<DocumentCard document={documentMock} />);

    expect(screen.getByText('Mon roman')).toBeInTheDocument();
    // Le style, le nombre de mots et la version sont dans des <span> séparés
    expect(screen.getByText('Roman')).toBeInTheDocument();
    expect(screen.getByText(/5\s+mots/)).toBeInTheDocument();
    expect(screen.getByText(/version\s+2/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ouvrir/i })).toHaveAttribute(
      'href',
      '/documents/doc-1'
    );
  });

  it('appelle onDelete après confirmation', () => {
    const onDelete = jest.fn();
    render(<DocumentCard document={documentMock} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: /Supprimer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Oui, supprimer/i }));

    expect(onDelete).toHaveBeenCalledWith('doc-1');
  });
});
