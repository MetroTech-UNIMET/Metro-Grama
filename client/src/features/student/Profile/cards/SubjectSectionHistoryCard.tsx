import { Calendar, CheckCircle2, ChevronRight, History } from 'lucide-react';
import { format } from 'date-fns';

import { usePagination } from '@/hooks/use-pagination';

import { cn } from '@utils/className';
import { ScheduleItem } from '@/features/weekly-schedule/weekly-schedule-sidebar/components/SubjectOfferDetail/SubjectOfferSchedulesList/ScheduleItem';

import { Card, CardHeader, CardTitle, CardContent } from '@ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNextButton,
  PaginationPreviousButton,
} from '@/components/ui/pagination';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PaginationDynamicItems } from '@/components/ui/derived/pagination-dynamic-items';

import type { SubjectSectionHistoryWithSchedules } from '@/interfaces/SubjectSectionHistory';

interface Props {
  subject_section_history: SubjectSectionHistoryWithSchedules[];
}
export function SubjectSectionHistoryCard({ subject_section_history }: Props) {
  const { currentData, currentPage, totalPages, goToPage, nextPage, prevPage } = usePagination({
    data: subject_section_history,
    itemsPerPage: 5,
  });

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial de Ediciones de Secciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subject_section_history.length === 0 ? (
          <p className="text-muted-foreground text-sm">No ha colaborado en los horarios de las materias.</p>
        ) : (
          <>
            {currentData.map((item) => (
              <SubjectSectionHistoryItem key={item.id.ID} item={item} />
            ))}

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPreviousButton
                      onClick={() => {
                        prevPage();
                      }}
                      currentPage={currentPage}
                    />
                  </PaginationItem>

                  <PaginationDynamicItems
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    maxShowingPages={7}
                  />

                  <PaginationItem>
                    <PaginationNextButton
                      onClick={() => {
                        nextPage();
                      }}
                      currentPage={currentPage}
                      totalPages={totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SubjectSectionHistoryItem({ item }: { item: SubjectSectionHistoryWithSchedules }) {
  const isCurrent = !item.end_date;

  return (
    <div className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>Sección {item.new_data.section_number}</span>
          {item.new_data.classroom_code && (
            <span className="text-muted-foreground">({item.new_data.classroom_code})</span>
          )}
        </div>
        {isCurrent && (
          <div className="text-success flex items-center gap-1 text-xs font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Actual</span>
          </div>
        )}
      </div>

      <div className="text-muted-foreground flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Desde: {format(new Date(item.start_date), 'dd/MM/yyyy HH:mm')}</span>
        </div>
        {!isCurrent && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Hasta: {format(new Date(item.end_date!), 'dd/MM/yyyy HH:mm')}</span>
          </div>
        )}
      </div>

      {/* Collapsible schedules */}
      {item.schedules && item.schedules.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                'flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium',
                'hover:bg-muted transition-colors',
              )}
              aria-label="Mostrar horarios"
            >
              Ver horarios
              <ChevronRight className="h-3 w-3 in-data-[state=open]:rotate-90" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 flex flex-row flex-wrap gap-8 space-y-2">
            {item.schedules.map((sch) => (
              <ScheduleItem key={sch.id.ID} schedule={sch} isSectionSelected={false} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
