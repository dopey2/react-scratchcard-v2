import type { ExampleDef } from '../registry';

export default function ExamplePage({ example }: { example: ExampleDef }) {
  const { component: Component, sourceFile } = example;

  return (
    <div className="p-8 min-h-full">
      <div className="flex justify-end mb-1">
        <a
          href={sourceFile}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          View source ↗
        </a>
      </div>
      <Component />
    </div>
  );
}
