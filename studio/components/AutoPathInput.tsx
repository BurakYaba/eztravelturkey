import { Box, Card, Checkbox, Flex, Select, Stack, Text } from '@sanity/ui';
import { useEffect, useMemo, useState } from 'react';
import { set, unset, useClient, useEditState, useFormValue, type StringInputProps } from 'sanity';

/**
 * The page address (`path`) of a new page is made from the page's title and folder, so the editor never has to know the pattern:
 *   tour        destinations/<country>/<length folder, Turkey and Greece only>/<title>
 *   blog post   blog/<country folder>/<title>
 *   blog topic  blog/<title>        author  authors/<title>        text page  <title>
 * It follows the title while the page has not been published. A published page keeps its address (changing it breaks the links
 * to it); the editor can still unlock it on purpose. It can also be written by hand at any time.
 */
export type PathKind = 'tour' | 'blogPost' | 'blogCategory' | 'author' | 'staticPage' | 'destinationPage';

const previewOrigin = process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? 'https://www.eztravelturkey.com';

/** `Best of Istanbul: 10 tips!` becomes `best-of-istanbul-10-tips`. */
export const slugOf = (title: string) => {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
};

type Parts = { title: string; language: string; parent: string; category: string; pageKind: string; folder: string };

/** The address a page would get, or '' when something it needs is missing. */
export function addressFor(kind: PathKind, { title, parent, category, pageKind, folder }: Parts): { path: string; missing: string } {
  const slug = slugOf(title);
  if (!title.trim()) {return { path: '', missing: 'Önce başlığı yazın.' };}
  // A title in Chinese leaves only its digits behind ("8"); that is no address, so the editor writes one.
  if (!slug || !/[a-z]/.test(slug)) {
    return { path: '', missing: 'Başlık Latin harfi içermiyor; adresi "Adresi kendim yazacağım" ile elle yazın (örneğin egypt-classic-8-days).' };
  }
  switch (kind) {
    case 'tour': {
      if (!parent) {return { path: '', missing: 'Önce "Ülke veya kombinasyon" alanını seçin.' };}
      const root = 'destinations';
      return { path: [root, parent, category.trim(), slug].filter(Boolean).join('/'), missing: '' };
    }
    case 'blogPost':
      return folder ? { path: `${folder}/${slug}`, missing: '' } : { path: '', missing: 'Önce blog klasörünü (ülke) seçin.' };
    case 'blogCategory':
      return { path: `blog/${slug}`, missing: '' };
    case 'author':
      return { path: `authors/${slug}`, missing: '' };
    case 'destinationPage':
      return pageKind === 'category'
        ? { path: '', missing: 'Kategori sayfalarında adresi elle yazın (ülke klasörü/kategori).' }
        : { path: `destinations/${slug}`, missing: '' };
    default:
      return { path: slug, missing: '' };
  }
}

export const autoPathInput = (kind: PathKind) =>
  function PathInput(props: StringInputProps) {
    return <AutoPathInput {...props} kind={kind} />;
  };

function AutoPathInput(props: StringInputProps & { kind: PathKind }) {
  const { kind, value, onChange } = props;
  const client = useClient({ apiVersion: '2025-01-01' });
  const id = ((useFormValue(['_id']) as string | undefined) ?? '').replace(/^drafts\./, '');
  const title = (useFormValue(['title']) as string | undefined) ?? '';
  const language = (useFormValue(['language']) as string | undefined) ?? 'en';
  const parent = (useFormValue(['parent']) as string | undefined) ?? '';
  const category = (useFormValue(['category']) as string | undefined) ?? '';
  const pageKind = (useFormValue(['kind']) as string | undefined) ?? '';

  // Whether the page is published, live: read once when the form opened, a page published during this very session still looked new,
  // kept following the title and moved to a new address at the next publish (found 2026-10-25 on the hosted Studio: the old address
  // answered 404). `ready` is false until the Studio knows; the address is left alone until then.
  const editState = useEditState(id, props.schemaType.name);
  const published: boolean | null = editState.ready ? Boolean(editState.published) : null;
  const [unlocked, setUnlocked] = useState(false);
  const [manual, setManual] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [folder, setFolder] = useState('');
  const [taken, setTaken] = useState<string[]>([]);

  useEffect(() => {
    if (kind !== 'blogPost') {return;}
    client
      .fetch<string[]>('*[_type == "blogCategory" && language == $language].path | order(@ asc)', { language })
      .then((paths) => setFolders(paths.filter((path) => path.split('/').length === 2)))
      .catch(() => setFolders([]));
  }, [client, kind, language]);

  // the folder of a post already written: `blog/turkey/x` -> `blog/turkey`
  const currentFolder = kind === 'blogPost' && value ? value.split('/').slice(0, 2).join('/') : '';
  // No folder is chosen for the editor: a wrong country in the address would be easy to miss.
  const chosenFolder = folder || (folders.includes(currentFolder) ? currentFolder : '');

  const wanted = useMemo(
    () => addressFor(kind, { title, language, parent, category, pageKind, folder: chosenFolder }),
    [kind, title, language, parent, category, pageKind, chosenFolder],
  );

  // Addresses already used in this language: the suggestion gets a number when it would clash.
  useEffect(() => {
    if (!wanted.path) {return;}
    const candidates = [wanted.path, ...Array.from({ length: 30 }, (_, n) => `${wanted.path}-${n + 2}`)];
    client
      .fetch<string[]>('*[defined(path) && language == $language && path in $candidates && !(_id in [$id, "drafts." + $id])].path', {
        language,
        candidates,
        id,
      })
      .then(setTaken)
      .catch(() => setTaken([]));
  }, [client, wanted.path, language, id]);

  const suggestion = useMemo(() => {
    if (!wanted.path) {return '';}
    if (!taken.includes(wanted.path)) {return wanted.path;}
    for (let n = 2; n < 100; n += 1) {
      if (!taken.includes(`${wanted.path}-${n}`)) {return `${wanted.path}-${n}`;}
    }
    return wanted.path;
  }, [wanted.path, taken]);

  const locked = published === true && !unlocked;
  const auto = published === false && !manual;

  // Follows the title (and folder) while the page is new; a short pause so it does not change on every key.
  useEffect(() => {
    if (!auto || !suggestion || suggestion === value) {return;}
    const timer = setTimeout(() => onChange(set(suggestion)), 500);
    return () => clearTimeout(timer);
  }, [auto, suggestion, value, onChange]);

  // A title that cannot make an address leaves it empty for the editor to write.
  useEffect(() => {
    if (auto && !wanted.path && value && !title.trim()) {onChange(unset());}
  }, [auto, wanted.path, value, title, onChange]);

  const full = value ? `${previewOrigin}/${language}/${value}/` : '';

  return (
    <Stack gap={3}>
      {kind === 'blogPost' && auto && (
        <Flex align="center" gap={2}>
          <Text size={1} muted>
            Blog klasörü:
          </Text>
          <Select value={chosenFolder} onChange={(event) => setFolder(event.currentTarget.value)} style={{ maxWidth: 260 }}>
            <option value="">— klasör seçin —</option>
            {folders.map((path) => (
              <option key={path} value={path}>
                {path}
              </option>
            ))}
          </Select>
        </Flex>
      )}

      {(published === true && unlocked) || (published === false && manual) ? (
        props.renderDefault(props)
      ) : (
        <Card padding={3} radius={2} border tone={locked ? 'transparent' : 'primary'}>
          <Text size={1} weight="semibold">
            {value || (wanted.missing ? '…' : 'Adres başlığa göre oluşturulacak')}
          </Text>
        </Card>
      )}

      {full && (
        <Text size={1} muted>
          Sitede şu adreste yayınlanır: {full}
        </Text>
      )}
      {!value && wanted.missing && (
        <Text size={1} muted>
          {wanted.missing}
        </Text>
      )}

      {published === false && (
        <Flex align="center" gap={2}>
          <Checkbox id={`${id}-manual`} checked={manual} onChange={(event) => setManual(event.currentTarget.checked)} />
          <Box>
            <Text as="label" htmlFor={`${id}-manual`} size={1}>
              Adresi kendim yazacağım (otomatik oluşturma kapalı)
            </Text>
          </Box>
        </Flex>
      )}
      {published === true && (
        <Card padding={3} radius={2} tone="caution" border>
          <Stack gap={3}>
            <Text size={1}>
              Bu sayfa yayınlandı; adresi sabit kalır. Adresi değiştirirseniz eski adres açılmaz ve bu adrese gelen bağlantılar ile Google sonuçları kaybolur
              {kind === 'blogPost' ? ' (blog yazılarında eski adresi aşağıdaki "eski adresler" alanına yazarsanız yönlendirilir)' : ''}.
            </Text>
            <Flex align="center" gap={2}>
              <Checkbox id={`${id}-unlock`} checked={unlocked} onChange={(event) => setUnlocked(event.currentTarget.checked)} />
              <Box>
                <Text as="label" htmlFor={`${id}-unlock`} size={1}>
                  Yine de adresi değiştirmek istiyorum
                </Text>
              </Box>
            </Flex>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
