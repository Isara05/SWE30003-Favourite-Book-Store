import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

interface StocktakePanelProps {
  staffId: string;
  isbn: string;
  actual: string;
  result: string | null;
  onStaffChange: (value: string) => void;
  onIsbnChange: (value: string) => void;
  onActualChange: (value: string) => void;
  onSubmit: () => void;
}

// Renders the stocktake panel section.
export function StocktakePanel({
  staffId,
  isbn,
  actual,
  result,
  onStaffChange,
  onIsbnChange,
  onActualChange,
  onSubmit,
}: StocktakePanelProps) {
  return (
    <section className="panel stack">
      <div>
        <h2 className="section-title">Stocktake</h2>
        <p className="muted">Submit a single ISBN count to update inventory.</p>
      </div>
      <div className="row">
        <Input label="Staff ID" value={staffId} onChange={(event) => onStaffChange(event.target.value)} />
        <Input label="ISBN" value={isbn} onChange={(event) => onIsbnChange(event.target.value)} />
        <Input
          label="Actual Count"
          type="number"
          value={actual}
          onChange={(event) => onActualChange(event.target.value)}
        />
      </div>
      <Button type="button" onClick={onSubmit}>
        Submit Stocktake
      </Button>
      {result ? <div className="banner">{result}</div> : null}
    </section>
  );
}
