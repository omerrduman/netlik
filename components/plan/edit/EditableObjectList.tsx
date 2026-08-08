"use client";

import EditableStringList from "./EditableStringList";

export interface ObjectListColumn<T> {
  key: keyof T;
  label: string;
  kind?: "text" | "textarea" | "stringList";
}

interface EditableObjectListProps<T extends Record<string, unknown>> {
  items: T[];
  columns: ObjectListColumn<T>[];
  emptyItem: T;
  onChange: (items: T[]) => void;
}

export default function EditableObjectList<T extends Record<string, unknown>>({
  items,
  columns,
  emptyItem,
  onChange,
}: EditableObjectListProps<T>) {
  function updateField(index: number, key: keyof T, value: unknown) {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, emptyItem]);
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface-raised p-3">
          <div className="flex flex-col gap-2">
            {columns.map((col) => (
              <label key={String(col.key)} className="flex flex-col gap-1">
                <span className="text-xs text-muted">{col.label}</span>
                {col.kind === "stringList" ? (
                  <EditableStringList
                    items={(item[col.key] as string[]) ?? []}
                    onChange={(value) => updateField(i, col.key, value)}
                  />
                ) : col.kind === "textarea" ? (
                  <textarea
                    value={String(item[col.key] ?? "")}
                    onChange={(e) => updateField(i, col.key, e.target.value)}
                    rows={2}
                    className="resize-none rounded-lg bg-surface px-3 py-1.5 text-sm text-foreground outline-none"
                  />
                ) : (
                  <input
                    value={String(item[col.key] ?? "")}
                    onChange={(e) => updateField(i, col.key, e.target.value)}
                    className="rounded-lg bg-surface px-3 py-1.5 text-sm text-foreground outline-none"
                  />
                )}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="mt-2 rounded-lg border border-border px-2 py-1 text-xs text-muted transition-colors hover:text-accent-orange"
          >
            Satırı Sil
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="self-start rounded-lg border border-accent-cyan/40 px-2.5 py-1 text-xs text-accent-cyan transition-colors hover:bg-accent-cyan/10"
      >
        + Satır Ekle
      </button>
    </div>
  );
}
