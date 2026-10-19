import { Stack, Text } from '@sanity/ui';
import type { StringInputProps } from 'sanity';

/**
 * Wraps a text input with a live character count, green inside the wanted range and orange outside it. The range is a
 * rule of thumb for Latin text (Google cuts long titles and descriptions); Chinese and Japanese characters are wider,
 * so for them the count is only a guide.
 */
export function lengthHint(min: number, max: number) {
  return function LengthHint(props: StringInputProps) {
    const length = typeof props.value === 'string' ? props.value.length : 0;
    const good = length >= min && length <= max;
    return (
      <Stack gap={2}>
        {props.renderDefault(props)}
        <Text size={1} style={{ color: length === 0 ? undefined : good ? '#1a7f37' : '#b45309' }} muted={length === 0}>
          {length} karakter (en uygun: {min}-{max})
        </Text>
      </Stack>
    );
  };
}
