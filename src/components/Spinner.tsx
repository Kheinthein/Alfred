interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<Required<SpinnerProps>['size'], string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
};

export function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-solid border-ai-primary border-t-transparent ${sizeMap[size]}`}
      role="status"
    >
      <span className="sr-only">Chargement...</span>
    </span>
  );
}
