import { notFound } from 'next/navigation';

/** Any address under a language that no other page claims: a real 404 with the language's own 404 page. */
export default function UnknownPage() {
  notFound();
}
