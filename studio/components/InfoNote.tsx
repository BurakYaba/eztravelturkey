import { Card, Stack, Text } from '@sanity/ui';
import type { StringInputProps } from 'sanity';

/**
 * A field that holds no data: it only shows a note in the form, for a tab of the tour page that is not edited in the tour itself
 * (the payment summary and the entry rules are the same for every tour and live in "Ortak tur metinleri").
 */
export const infoNote = (lines: string[]) =>
  function Note(_props: StringInputProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return (
      <Card padding={3} radius={2} tone="primary" border>
        <Stack gap={3}>
          {lines.map((line) => (
            <Text key={line} size={1}>
              {line}
            </Text>
          ))}
        </Stack>
      </Card>
    );
  };
