import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "../styles";

interface ItemCollectionProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onItemClicked?: (item: T) => void;
  className?: string;
  draggable?: boolean;
  onDragEnd?: (result: any) => void;
  layout?: "grid" | "flex";
  gridCols?: string;
  flexDirection?: "row" | "col";
  flexWrap?: boolean;
}

const ItemCollection = <T,>({
  items,
  renderItem,
  onItemClicked,
  className,
  draggable = false,
  onDragEnd,
  layout = "grid",
  gridCols = "grid-cols-1",
  flexDirection = "col",
  flexWrap = true,
}: ItemCollectionProps<T>) => {
  const handleDragEnd = (result: any) => {
    if (onDragEnd) {
      onDragEnd(result);
    }
  };

  // Build layout classes based on layout type
  const getLayoutClasses = () => {
    if (layout === "flex") {
      const flexClasses = [
        "flex",
        flexDirection === "row" ? "flex-row" : "flex-col",
        flexWrap ? "flex-wrap" : "flex-nowrap",
        "gap-4",
        "w-fit",
      ];
      return flexClasses.join(" ");
    } else {
      // Grid layout
      return `grid ${gridCols} gap-4 w-fit`;
    }
  };

  if (!draggable) {
    return (
      <section className={cn(getLayoutClasses(), className)}>
        {items.map((item, index) => (
          <article
            key={index}
            className={cn(
              "relative rounded-xl w-full group",
              layout === "flex" && flexDirection === "row" && "flex-shrink-0",
            )}
            role={onItemClicked ? "button" : undefined}
            tabIndex={onItemClicked ? 0 : undefined}
            aria-label={`Item no. ${index}`}
            onKeyDown={(e) => {
              if (onItemClicked && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onItemClicked(item);
              }
            }}
          >
            {renderItem(item, index)}
          </article>
        ))}
      </section>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="item-collection">
        {(provided) => (
          <section
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(getLayoutClasses(), className)}
          >
            {items.map((item, index) => (
              <Draggable
                key={index}
                draggableId={index.toString()}
                index={index}
              >
                {(provided, snapshot) => (
                  <article
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "relative rounded-xl w-full group",
                      layout === "flex" &&
                        flexDirection === "row" &&
                        "flex-shrink-0",
                      snapshot.isDragging && "opacity-50",
                    )}
                    role={onItemClicked ? "button" : undefined}
                    tabIndex={onItemClicked ? 0 : undefined}
                    aria-label={`Item no. ${index}`}
                    onKeyDown={(e) => {
                      if (
                        onItemClicked &&
                        (e.key === "Enter" || e.key === " ")
                      ) {
                        e.preventDefault();
                        onItemClicked(item);
                      }
                    }}
                  >
                    {renderItem(item, index)}
                  </article>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </section>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ItemCollection;
