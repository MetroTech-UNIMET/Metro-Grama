import { CareerMultiDropdown } from '@components/CareerMultiDropdown';
import GoogleLogin from '@ui/derived/GoogleLogin';

import type { CareerOption } from '@/hooks/queries/career/use-fetch-careers';
import { Tabs, TabsList, TabsTrigger } from '@ui/tabs';

interface Props {
  selectedCareers: CareerOption[];
  setSelectedCareers: (careers: CareerOption[]) => void;

  onlyElectives: boolean;
  setOnlyElectives: (onlyElectives: boolean) => void;

  loadingSubjects: boolean;
  loadingCareers: boolean;
}

export function HeaderGraph({
  selectedCareers,
  setSelectedCareers,
  onlyElectives,
  setOnlyElectives,
  loadingSubjects,
  loadingCareers,
}: Props) {
  return (
    <div className="fixed z-10 flex w-full flex-row flex-wrap gap-4 pr-12">
      {/* <SideBarGraph /> */}

      <div className="flex flex-col gap-2">
        <GoogleLogin />

        <Tabs
          defaultValue={onlyElectives ? 'electives' : 'by-career'}
          className="mx-auto"
          onValueChange={(value) => setOnlyElectives(value === 'electives')}
        >
          <TabsList>
            <TabsTrigger value="by-career">Por carrera</TabsTrigger>

            <TabsTrigger value="electives">Electivas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="w-full max-w-sm">
        <CareerMultiDropdown
          value={selectedCareers}
          onChange={setSelectedCareers}
          loadingSubjects={loadingSubjects}
          isLoading={loadingCareers}
          disabled={onlyElectives}
        />
      </div>
    </div>
  );
}
