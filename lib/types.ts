export interface Museum {
  name: string;
  tagline: string;
  about: string;
  contact: string;
}

export interface Category {
  slug: string;
  name: string;
  wing: string;
  color: string;
  colorName: string;
  ordinal: number;
  blurb: string;
}

export interface Piece {
  slug: string;
  title: string;
  category: string;
  year: number;
  yearIsPlaceholder: boolean;
  image: string;
  catalogNo: string;
  description: string;
  descriptionIsPlaceholder: boolean;
}

export interface MuseumData {
  museum: Museum;
  categories: Category[];
  pieces: Piece[];
}
