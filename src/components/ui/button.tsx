import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* Buttons speak the eyebrow language: small tracked caps, square-ish
   corners, colour-only transitions. No shadows, no rounded pills. */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-xs border font-body font-medium tracking-caps uppercase whitespace-nowrap select-none transition-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover",
        outline:
          "border-ink bg-transparent text-ink hover:border-transparent hover:bg-hover hover:text-on-hover",
        ghost:
          "border-transparent bg-transparent text-ink hover:bg-hover hover:text-on-hover",
        inverse:
          "border-on-inverse bg-transparent text-on-inverse hover:bg-on-inverse hover:text-inverse",
        link: "h-auto rounded-none border-transparent bg-transparent p-0 font-normal tracking-normal normal-case text-accent hover-underline",
      },
      size: {
        default: "h-11 px-5 type-small",
        sm: "h-9 px-4 type-caption",
        lg: "h-12 px-6 type-small",
        icon: "size-11 type-small",
        "icon-sm": "size-9 type-caption",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
