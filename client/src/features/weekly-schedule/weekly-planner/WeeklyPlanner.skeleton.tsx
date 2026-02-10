import { SidebarInset, SidebarProvider } from '@ui/sidebar';
import { Skeleton } from '@ui/skeleton';

export default function WeeklyScheduleSkeleton() {
  // mimic WeeklyPlanner defaults: 7 days, ~12 visible rows at 3.5rem
  const rows = Array.from({ length: 12 });
  const days = Array.from({ length: 7 });

  return (
    <SidebarProvider customWidth="20rem">
      <SidebarInset className="relative pb-16">
        {/* Match WeeklyPlanner container and CSS var used for row height */}
        <div
          className="mx-auto flex w-full max-w-7xl flex-col gap-4 overflow-auto pr-9 pl-18"
          style={{ ['--height-row' as any]: '3.5rem' }}
        >
          {/* MOBILE VIEW (tabs + single day column) */}
          <div className="lg:hidden">
            {/* Tabs header (Mon-Sun) */}
            <div className="bg-background/70 supports-[backdrop-filter]:bg-background/40 sticky top-0 z-10 -mb-2 pt-4 pb-2 backdrop-blur">
              <div className="flex flex-wrap items-center gap-2 px-2">
                {days.map((_, i) => (
                  <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-full" />
                ))}
              </div>
            </div>

            {/* One day column with hour rows */}
            <div className="relative rounded-md border bg-white p-2">
              <div className="flex flex-col gap-2">
                {rows.map((_, i) => (
                  <div key={i} className="relative" style={{ height: 'var(--height-row)' }}>
                    <div className="border-muted/60 absolute inset-x-0 top-0 border-t" />
                    <Skeleton className="mx-2 mt-2 h-8 rounded" style={{ opacity: i % 3 === 0 ? 0.45 : 0.25 }} />
                  </div>
                ))}
              </div>
              {/* Example floating event */}
              <div className="pointer-events-none absolute top-16 right-4 left-4">
                <Skeleton className="h-[calc(var(--height-row)*1.5)] rounded-md" />
              </div>
            </div>
          </div>

          {/* DESKTOP VIEW (time column + 7 day columns + grid) */}
          <div className="hidden lg:flex lg:flex-col lg:gap-3 lg:pt-6">
            {/* Day headers with empty time slot at left */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] items-end gap-2 px-2">
              <div />
              {days.map((_, i) => (
                <Skeleton key={i} className="h-5 w-24" />
              ))}
            </div>

            <div className="relative rounded-md bg-white">
              {/* Columns: time + 7 days */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                {/* Time labels */}
                <div className="flex flex-col gap-2 p-2">
                  {rows.map((_, i) => (
                    <div key={i} className="flex items-center" style={{ height: 'var(--height-row)' }}>
                      <Skeleton className="mt-1 h-4 w-10" />
                    </div>
                  ))}
                </div>

                {/* Day columns with subtle blocks */}
                {days.map((_, dayIdx) => (
                  <div key={dayIdx} className="border-l p-2">
                    <div className="flex flex-col gap-2">
                      {rows.map((_, i) => (
                        <div key={i} className="relative" style={{ height: 'var(--height-row)' }}>
                          <div className="border-muted/60 absolute inset-x-0 top-0 border-t" />
                          <Skeleton className="mt-2 h-10 w-full rounded" style={{ opacity: i % 3 === 0 ? 0.5 : 0.3 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating event placeholders to hint content */}
              <div className="pointer-events-none absolute top-[80px] left-[160px]">
                <Skeleton className="h-[calc(var(--height-row)*1.5)] w-48 rounded-md" />
              </div>
              <div className="pointer-events-none absolute top-[200px] left-[420px]">
                <Skeleton className="h-[calc(var(--height-row)*1.8)] w-52 rounded-md" />
              </div>
            </div>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
