import { useFormContext } from 'react-hook-form';

import { Button } from '../button';

import { cn } from '@/lib/utils/className';

import { Spinner } from '@/components/ui/spinner';

interface Props extends React.ComponentProps<typeof Button> {}

export function LoadingButton({ disabled, children, isLoading, className, ...props }: Props & { isLoading: boolean }) {
  return (
    <Button className={cn('group gap-x-2', className)} {...props}>
      {isLoading && (
        <Spinner
          className={cn('h-6 w-6', {
            'text-secondary group-hover:text-primary': props.variant === 'outline',
            'text-white': props.colors === 'primary',
            'text-primary': !(props.variant === 'outline' || props.colors === 'primary'),
          })}
        />
      )}
      {children}
    </Button>
  );
}

export default function SubmitButton({ disabled, ...props }: Props) {
  const {
    formState: { isSubmitting, isSubmitSuccessful },
  } = useFormContext();

  return (
    <LoadingButton disabled={disabled || isSubmitting || isSubmitSuccessful} isLoading={isSubmitting} {...props} />
  );
}
