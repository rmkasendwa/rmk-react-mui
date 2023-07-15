export const timeScaleOptions = [
  'Day',
  'Week',
  '2 week',
  'Month',
  'Quarter',
  'Year',
  '5 year',
] as const;
export type TimeScaleOption = (typeof timeScaleOptions)[number];

export const fullMonthLabels = [
  'January',
  'Febuary',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const shortMonthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
