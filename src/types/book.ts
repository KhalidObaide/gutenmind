interface BookMetadata {
  title: string;
  author: string;
  language: string;
  attributes: { key: string; value: string }[];
}

export { type BookMetadata };
