import { cn, sharedStyles } from "../styles";
import type React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

const Card = ({ className, children, hover }: CardProps) => {
  return (
    <div
      className={cn(
        sharedStyles.layout.flex.col,
        sharedStyles.layout.flex.align.center,
        "p-6",
        "shadow-sm",
        "backdrop-blur-sm",
        "relative overflow-ellipsis",
        hover && "hover:shadow-md transition-shadow duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;
