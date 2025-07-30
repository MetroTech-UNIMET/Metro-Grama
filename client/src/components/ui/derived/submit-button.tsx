import { cn } from "@/lib/utils/className";

import { Button } from "../button";
import { Spinner } from "@/components/ui/spinner";
import { useFormContext } from "react-hook-form";

interface Props extends React.ComponentProps<typeof Button> {}

export default function SubmitButton({
  disabled,
  children,
  className,
  ...props
}: Props) {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <Button type="submit" className={cn("group gap-x-2", className)} {...props}>
      {isSubmitting && (
        <Spinner
        // className={cn("h-6 w-6", {
        //   "border-secondary group-hover:border-primary":
        //     props.variant === "outline-solid",
        //   "border-secondary": props.colors === "primary",
        //   "border-primary": !(
        //     props.variant === "outline-solid" || props.colors === "primary"
        //   ),
        // })}
        />
      )}
      {children}
    </Button>
  );
}
