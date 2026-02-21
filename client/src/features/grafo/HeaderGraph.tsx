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
    <div className="fixed z-10 flex w-full flex-row flex-wrap justify-between gap-4 px-8">
      {/* <SideBarGraph /> */}

      <div className="flex flex-row flex-wrap gap-2">
        <Tabs
          defaultValue={onlyElectives ? 'electives' : 'by-career'}
          className=" h-11"
          onValueChange={(value) => setOnlyElectives(value === 'electives')}
        >
          <TabsList className="h-full">
            <TabsTrigger value="by-career">Por carrera</TabsTrigger>

            <TabsTrigger value="electives">Electivas</TabsTrigger>
          </TabsList>
        </Tabs>

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

      <GoogleLogin />
    </div>
  );
}
