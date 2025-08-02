import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "../styles";

interface ItemCollectionProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onItemClicked?: (item: T) => void;
  className?: string;
  draggable?: boolean;
  onDragEnd?: (result: any) => void;
}

const ItemCollection = <T,>({
  items,
  renderItem,
  onItemClicked,
  className,
  draggable = false,
  onDragEnd,
}: ItemCollectionProps<T>) => {
  const handleDragEnd = (result: any) => {
    if (onDragEnd) {
      onDragEnd(result);
    }
  };

  if (!draggable) {
    return (
      <section
        className={cn(
          "grid grid-cols-1 lg:grid-cols-2 xxl:grid-cols-3 gap-4 w-fit",
          className,
        )}
      >
        {items.map((item, index) => (
          <article
            key={index}
            className={cn("relative rounded-xl w-full group")}
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
            className={cn(
              "grid grid-cols-1 lg:grid-cols-2 xxl:grid-cols-3 gap-4 w-fit",
              className,
            )}
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
