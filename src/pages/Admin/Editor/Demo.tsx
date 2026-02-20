interface EditorProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

const Editor = ({
  value = "",
  onChange,
  placeholder = "Write something...",
  rows = 5,
  className = "",
  disabled = false,
}: EditorProps) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
    />
  );
};

export default Editor;
