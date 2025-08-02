import { cn } from "../../shared/styles";

interface ItemCollectionProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onItemClicked?: (item: T) => void;
  className?: string;
}

const ItemCollection = <T,>({
  items,
  renderItem,
  onItemClicked,
  className,
}: ItemCollectionProps<T>) => (
  <section className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", className)}>
    {items.map((item, index) => (
      <article
        key={index}
        className={cn("relative rounded-xl group w-full min-w-0")}
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

export default ItemCollection;
