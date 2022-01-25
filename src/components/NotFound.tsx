import React from 'react';

interface INotFoundProps {
  width: number;
}

export const NotFound: React.FC<INotFoundProps> = (props) => {
  return (
    <svg
      viewBox="0 0 190 87"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M52 53.0075V3.00749H33L0 56.0075L0.999999 68.0075H33V85.0075H52V68.0075H60V53.0075H52ZM33 53.0075H18L32 30.0075L33 28.0075V53.0075ZM182 53.0075V3.00749H163L130 56.0075L131 68.0075H163V85.0075H182V68.0075H190V53.0075H182ZM163 53.0075H148L162 30.0075L163 28.0075V53.0075ZM121 27.0075V86.0075H69V78.0075V27.0075C69 12.0075 81 1.00749 95 1.00749C110 0.0074932 121 12.0075 121 27.0075Z"
        fill="#BABCC1"
      />
    </svg>
  );
};

export default NotFound;
