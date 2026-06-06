import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

// Renders the search bar section.
export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  return (
    <div className="row">
      <Input label="Search" value={value} onChange={(event) => onChange(event.target.value)} />
      <Button type="button" onClick={onSearch}>
        Search
      </Button>
    </div>
  );
}
