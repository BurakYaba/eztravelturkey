import { faq, imageBlock, list, paragraph, picture, section, table, tableRow } from './fields';
import { author, blogCategory, blogPost, destinationPage, homePage, hubPage, staticPage } from './pages';
import { teamMember } from './team';
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
  teamMember,
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
