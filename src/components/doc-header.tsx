interface DocHeaderProps {
  title: string;
  description?: string;
}

export function DocHeader({ title }: DocHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="h-1 w-20 bg-blue-600 mt-2"></div>
    </div>
  );
} 