// Path: src/app/components/body/variables/data/table/modal/chart/chart.interface.ts
export const backgroundColor = [
  '#FFBE98',
  '#EB9FEF',
  '#CFEBDF',
  '#1AFFD5',
  '#9CEC5B',
  '#65AFFF',
  '#32936F',
  '#C7DBE6',
  '#008148',
  '#BF0603',
  '#82D173',
  '#ACD2ED',
  '#6761A8',
  '#B9FFB7',
  '#758BFD',
  '#D44D5C',
  '#5574A6'
];

/* Randomize array in-place using Durstenfeld shuffle algorithm */
export function shuffleColours(): string[] {
  const colours = backgroundColor;
  for (let i = colours.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = colours[i];
    colours[i] = colours[j];
    colours[j] = temp;
  }
  return colours;
}
