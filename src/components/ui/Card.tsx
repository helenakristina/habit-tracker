import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", noPadding = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm
          ${noPadding ? "" : "p-4 sm:p-6"} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
