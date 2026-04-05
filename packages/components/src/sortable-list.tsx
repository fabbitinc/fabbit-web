import { type ReactNode, useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@fabbit/ui";

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

/* ─── Types ─── */

export interface SortableListColumn<T> {
  key: string;
  header: ReactNode;
  render: (item: T) => ReactNode;
  className?: string;
}

export interface SortableListProps<T> {
  items: T[];
  columns: SortableListColumn<T>[];
  getItemId: (item: T) => string;
  onReorder: (reorderedItems: T[]) => void;
  renderActions?: (item: T) => ReactNode;
  gridTemplateColumns: string;
  emptyMessage?: string;
}

/* ─── Sortable Row ─── */

function SortableRow<T>({
  item,
  columns,
  getItemId,
  renderActions,
  gridTemplateColumns,
}: {
  item: T;
  columns: SortableListColumn<T>[];
  getItemId: (item: T) => string;
  renderActions?: (item: T) => ReactNode;
  gridTemplateColumns: string;
}) {
  const id = getItemId(item);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "grid items-center border-t border-border/70 bg-card text-sm",
        isDragging && "opacity-0",
      )}
      style={{
        gridTemplateColumns,
        transform: CSS.Translate.toString(transform),
        transition,
      }}
    >
      <div className="flex items-center justify-center px-2 py-3">
        <button
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          type="button"
          aria-label="드래그하여 순서 변경"
          {...attributes}
          {...listeners}
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="9" cy="5" r="1" fill="currentColor" />
            <circle cx="15" cy="5" r="1" fill="currentColor" />
            <circle cx="9" cy="12" r="1" fill="currentColor" />
            <circle cx="15" cy="12" r="1" fill="currentColor" />
            <circle cx="9" cy="19" r="1" fill="currentColor" />
            <circle cx="15" cy="19" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>
      {columns.map((col) => (
        <div key={col.key} className={cn("px-4 py-3", col.className)}>
          {col.render(item)}
        </div>
      ))}
      {renderActions ? (
        <div className="px-4 py-3">
          {renderActions(item)}
        </div>
      ) : null}
    </div>
  );
}

/* ─── Overlay Row ─── */

function OverlayRow<T>({
  item,
  columns,
  gridTemplateColumns,
}: {
  item: T;
  columns: SortableListColumn<T>[];
  gridTemplateColumns: string;
}) {
  return (
    <div
      className="grid items-center rounded-lg border border-primary/30 bg-card text-sm shadow-xl"
      style={{ gridTemplateColumns }}
    >
      <div className="flex items-center justify-center px-2 py-3">
        <svg className="size-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <circle cx="9" cy="5" r="1" fill="currentColor" />
          <circle cx="15" cy="5" r="1" fill="currentColor" />
          <circle cx="9" cy="12" r="1" fill="currentColor" />
          <circle cx="15" cy="12" r="1" fill="currentColor" />
          <circle cx="9" cy="19" r="1" fill="currentColor" />
          <circle cx="15" cy="19" r="1" fill="currentColor" />
        </svg>
      </div>
      {columns.map((col) => (
        <div key={col.key} className={cn("px-4 py-3", col.className)}>
          {col.render(item)}
        </div>
      ))}
      <div className="px-4 py-3" />
    </div>
  );
}

/* ─── Main Component ─── */

export function SortableList<T>({
  items,
  columns,
  getItemId,
  onReorder,
  renderActions,
  gridTemplateColumns,
  emptyMessage = "항목이 없습니다.",
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId]);
  const activeItem = activeId ? items.find((item) => getItemId(item) === activeId) ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);

      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
      const newIndex = items.findIndex((item) => getItemId(item) === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      onReorder(arrayMove(items, oldIndex, newIndex));
    },
    [items, getItemId, onReorder],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const headerGridTemplateColumns = gridTemplateColumns;

  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        {/* Header */}
        <div
          className="grid items-center bg-muted/40 text-sm text-muted-foreground"
          style={{ gridTemplateColumns: headerGridTemplateColumns }}
        >
          <div className="px-2 py-3" />
          {columns.map((col) => (
            <div key={col.key} className={cn("px-4 py-3 font-medium", col.className)}>
              {col.header}
            </div>
          ))}
          {renderActions ? <div className="px-4 py-3 font-medium">관리</div> : null}
        </div>

        {/* Body */}
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.length > 0 ? (
            items.map((item) => (
              <SortableRow
                key={getItemId(item)}
                columns={columns}
                getItemId={getItemId}
                gridTemplateColumns={gridTemplateColumns}
                item={item}
                renderActions={renderActions}
              />
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <OverlayRow
              columns={columns}
              gridTemplateColumns={gridTemplateColumns}
              item={activeItem}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
