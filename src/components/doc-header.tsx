interface DocHeaderProps {
  title: string;
  description?: string;
}

export function DocHeader({ title, description }: DocHeaderProps) {
  return (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {description && <p className="text-lg text-gray-600">{description}</p>}
    </div>
  );
} 