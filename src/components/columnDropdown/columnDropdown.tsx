import "./columnDropdown.css";

type SetColumnText = (text: string) => void;

interface ColumnDropdownProps {
  options: { text: string; abbrev: string }[];
  columnText: string;
  setColumnText: SetColumnText;
}

const ColumnDropdown = ({
  options,
  columnText,
  setColumnText,
}: ColumnDropdownProps) => {
  return (
    <div className="columndropdown">
      <div className="columnText">
        <div>{columnText}</div>
        <select
          className="columndropdown"
          value={columnText}
          onChange={(e) => setColumnText(e.target.value)}
        >
          {options.map((option) => {
            return (
              <option key={option.text} value={option.abbrev}>
                {option.text}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default ColumnDropdown;
