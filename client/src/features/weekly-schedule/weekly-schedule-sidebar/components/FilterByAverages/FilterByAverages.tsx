import { Label } from '@ui/label';
import { Slider } from '@ui/slider';

interface Props {
  filters: {
    minDifficulty: number;
    maxDifficulty: number;
    minGrade: number;
    maxGrade: number;
    minWorkload: number;
    maxWorkload: number;
  };
  setDifficultyRange: (range: [number, number]) => void;
  setGradeRange: (range: [number, number]) => void;
  setWorkloadRange: (range: [number, number]) => void;
}

export function FilterByAverages({ filters, setDifficultyRange, setGradeRange, setWorkloadRange }: Props) {
  return (
    <div className="space-y-6">
      <FilterSlider
        label="Dificultad"
        min={0}
        max={10}
        value={[filters.minDifficulty, filters.maxDifficulty]}
        onChange={setDifficultyRange}
      />
      <FilterSlider
        label="Nota"
        min={0}
        max={20}
        value={[filters.minGrade, filters.maxGrade]}
        onChange={setGradeRange}
      />
      <FilterSlider
        label="Carga"
        min={0}
        max={10}
        value={[filters.minWorkload, filters.maxWorkload]}
        onChange={setWorkloadRange}
      />
    </div>
  );
}

function FilterSlider({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: [number, number];
  onChange: (val: [number, number]) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-muted-foreground text-xs">
          {value[0]} - {value[1]}
        </span>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={1}
        minStepsBetweenThumbs={1}
        onValueChange={(vals) => onChange(vals as [number, number])}
        className="w-full"
      />
    </div>
  );
}
