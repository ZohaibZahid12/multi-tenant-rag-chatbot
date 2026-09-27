import { cn } from "@/lib/format";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "icon" | "icon-sm";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-hover",
  secondary: "border border-line bg-surface text-ink hover:bg-sunken",
  ghost: "text-muted hover:bg-sunken hover:text-ink",
  danger: "bg-danger text-surface hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-2.5 text-sm",
  md: "h-10 gap-2 px-4 text-[0.9375rem]",
  icon: "size-10",
  "icon-sm": "size-8",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}
