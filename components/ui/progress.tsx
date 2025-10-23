interface ProgressProps {
  value: number;
}

export const Progress: React.FC<ProgressProps> = ({ value }) => (
  <div className="relative pt-1">
    <div className="flex mb-2 items-center justify-between">
      <div>
        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
          Progress
        </span>
      </div>
    </div>
    <div className="flex mb-2">
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  </div>
);
