export type ExampleProps = {
  title: string;
  description: string;
  complete?: boolean;
  controls?: React.ReactNode;
  children: React.ReactNode;
};

export function Example({ title, description, complete, controls, children }: ExampleProps) {
  return (
    <div className="flex gap-10 items-start py-8">
      {children}
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-slate-900 m-0">{title}</h3>
        <p className="text-sm text-slate-500 m-0 max-w-xs leading-relaxed">{description}</p>
        {controls && (
          <div className="flex flex-col gap-2 mt-1 max-w-[130px]">
            {controls}
          </div>
        )}
        {complete !== undefined && (
          <div className={`text-xs mt-1 ${complete ? 'text-emerald-600' : 'text-slate-300'}`}>
            {complete ? '● complete' : '○ pending'}
          </div>
        )}
      </div>
    </div>
  );
}

export function Result() {
  return (
    <div className="flex w-full h-full items-center justify-center bg-white">
      <p className="text-slate-400 text-sm m-0">Your content here</p>
    </div>
  );
}

