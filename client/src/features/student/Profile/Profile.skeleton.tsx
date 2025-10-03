import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Skeleton } from '@ui/skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-28" />
          <div className="pt-2">
            <Skeleton className="h-9 w-40" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-44" />
        </CardContent>
      </Card>
    </div>
  );
}
