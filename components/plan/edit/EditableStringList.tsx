"use client";

interface EditableStringListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export default function EditableStringList({
  items,
  onChange,
  placeholder = "Yeni öğe...",
}: EditableStringListProps) {
  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg bg-surface-raised px-3 py-1.5 text-sm text-foreground outline-none"
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="shrink-0 rounded-lg border border-border px-2 py-1 text-xs text-muted transition-colors hover:text-accent-orange"
          >
            Sil
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="self-start rounded-lg border border-accent-cyan/40 px-2.5 py-1 text-xs text-accent-cyan transition-colors hover:bg-accent-cyan/10"
      >
        + Ekle
      </button>
    </div>
  );
}
