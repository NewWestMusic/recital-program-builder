import { v4 as uuidv4 } from 'uuid';

export interface Performer {
  id: string;
  name: string;
  piece: string;
}

export interface ProgramData {
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  logo: string | null;
  background: string | null;
  performers: Performer[];
  themeColor: string;
  fontFamily: string;
  layout: '1-column' | 'folded';
  fontSizeScale: number;
  nameColumnWidth: number;
  headerSpacing: number;
  titleFontSizeScale: number;
  logoPosition?: { x: number; y: number };
  headerPosition?: { x: number; y: number };
  firstColumnLimit?: number;
}

export const initialData: ProgramData = {
  title: 'Spring Recital',
  subtitle: 'Featuring the students of Jane Doe',
  date: 'May 15, 2026',
  time: '2:00 PM',
  location: 'Community Center Auditorium',
  logo: null,
  background: null,
  performers: [
    { id: uuidv4(), name: 'Alice Smith', piece: 'Minuet in G Major - J.S. Bach' },
    { id: uuidv4(), name: 'Bob Johnson', piece: 'Sonatina in C Major, Op. 36 No. 1 - M. Clementi' },
    { id: uuidv4(), name: 'Charlie Brown', piece: 'Fur Elise - L. van Beethoven' },
    { id: uuidv4(), name: 'Diana Prince', piece: 'Prelude in C Major - J.S. Bach' },
    { id: uuidv4(), name: 'Evan Wright', piece: 'The Entertainer - S. Joplin' },
  ],
  themeColor: '#1e293b',
  fontFamily: 'serif',
  layout: 'folded',
  fontSizeScale: 1,
  nameColumnWidth: 40,
  headerSpacing: 1.5,
  titleFontSizeScale: 1,
  logoPosition: { x: 0, y: 0 },
  headerPosition: { x: 0, y: 0 },
  firstColumnLimit: undefined,
};
