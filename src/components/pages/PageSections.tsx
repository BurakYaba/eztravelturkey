import { Picture } from '../shared/Picture';
import type { PageBlock, PageSection } from '@/lib/data/types';
import { cn } from '@/lib/utils';

function Block({ block }: { block: PageBlock }) {
  switch (block.type) {
    case 'p':
      return <p className="text-ink/90 leading-relaxed">{block.text}</p>;
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <List className={cn('text-ink/90 space-y-1.5 pl-5', block.ordered ? 'list-decimal' : 'list-disc')}>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </List>
      );
    }
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="border-cream-200 w-full border-collapse border text-left text-[0.95rem]">
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-cream-200 border-b">
                  {row.map((cell, c) => (
                    <td key={c} className="px-3 py-2 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return (
        <figure className="bg-cream-100 relative aspect-[3/2] max-w-3xl overflow-hidden rounded-lg">
          <Picture image={block.image} sizes="(min-width: 1024px) 48rem, 100vw" />
        </figure>
      );
  }
}

/** The text of a scraped page, section by section, exactly as the old page had it. */
export function PageSections({ sections, className }: { sections: PageSection[]; className?: string }) {
  return (
    <div className={cn('space-y-10', className)}>
      {sections.map((section, i) => {
        const Heading = section.level >= 3 ? 'h3' : 'h2';
        return (
          <section key={i} className="space-y-4">
            {section.heading && (
              <Heading className={section.level >= 3 ? 'h-card' : 'h-section'}>{section.heading}</Heading>
            )}
            {section.blocks.map((block, b) => (
              <Block key={b} block={block} />
            ))}
          </section>
        );
      })}
    </div>
  );
}
