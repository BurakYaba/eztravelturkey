import { Button, Flex, Select, Stack, Text } from '@sanity/ui';
import { useEffect, useState } from 'react';
import { set, useClient, useFormValue, type StringInputProps } from 'sanity';

/** `Best of Istanbul: 10 tips!` becomes `best-of-istanbul-10-tips`. */
const slugify = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

/**
 * The address field of a blog post with a helper: pick the country folder, press the button and the address is built
 * from the folders of the old site (`blog/<country>/<title>`). The field stays editable by hand.
 */
export function BlogPathInput(props: StringInputProps) {
  const client = useClient({ apiVersion: '2025-01-01' });
  const title = useFormValue(['title']) as string | undefined;
  const language = useFormValue(['language']) as string | undefined;
  const [folders, setFolders] = useState<string[]>([]);
  const [folder, setFolder] = useState('');

  useEffect(() => {
    if (!language) {return;}
    client
      .fetch<string[]>('*[_type == "blogCategory" && language == $language].path | order(@ asc)', { language })
      .then((paths) => setFolders(paths))
      .catch(() => setFolders([]));
  }, [client, language]);

  const chosen = folder || folders[0] || '';
  const suggestion = chosen && title ? `${chosen}/${slugify(title)}` : '';

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
      <Flex gap={2} align="center" wrap="wrap">
        <Select value={chosen} onChange={(event) => setFolder(event.currentTarget.value)} style={{ maxWidth: 240 }}>
          {folders.length === 0 && <option value="">Choose the language first</option>}
          {folders.map((path) => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
        </Select>
        <Button
          text="Build address from the title"
          mode="ghost"
          disabled={!suggestion}
          onClick={() => props.onChange(set(suggestion))}
        />
      </Flex>
      {suggestion && (
        <Text size={1} muted>
          Suggestion: {suggestion}
        </Text>
      )}
    </Stack>
  );
}
