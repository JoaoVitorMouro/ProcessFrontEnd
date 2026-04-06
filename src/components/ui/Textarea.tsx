interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={3}
        className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors
          placeholder:text-gray-400
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
