import { Spinner } from '@ui/spinner';

export default function LoadingPage() {
  return (
    <div className='flex h-svh w-full items-center justify-center'>
      <Spinner size="giant" />
    </div>
  );
}
