import { type FC } from "react";

// Define an interface for component props
interface ExampleProps {
  title: string;
  count?: number; // Optional prop with '?'
  onAction: (id: number) => void;
}

// Use the interface with the FC (FunctionComponent) type
const ExampleTS: FC<ExampleProps> = ({ title, count = 0, onAction }) => {
  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">{title}</h2>
      <p>Count: {count}</p>
      <button onClick={() => onAction(count)} className="px-4 py-2 bg-blue-500 text-white rounded">
        Click me
      </button>
    </div>
  );
};

export default ExampleTS;
