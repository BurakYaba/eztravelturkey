import { faq, imageBlock, list, paragraph, picture, section, table, tableRow } from './fields';
import { author, blogCategory, blogPost, destinationPage, homePage, hubPage, staticPage } from './pages';
import { tour } from './tour';

export const schemaTypes = [
  // documents
  tour,
  destinationPage,
  blogPost,
  blogCategory,
  author,
  staticPage,
  hubPage,
  homePage,
  // building blocks
  picture,
  faq,
  section,
  paragraph,
  list,
  table,
  tableRow,
  imageBlock,
];
