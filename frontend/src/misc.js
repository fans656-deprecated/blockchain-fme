import React from 'react';

export const Money = ({value, unit, className}) => {
  return (
    <div className={`money ` + className}>
      <span className="value">{value ? value.toFixed(2) : '--'}</span>
      <span>{unit}</span>
    </div>
  );
}

export const Percent = ({value, className}) => {
  value *= 100;
  let repr = null;
  if (!value) {
    repr = '--';
  } else if (value < 10000) {
    repr = value.toFixed(2) + '%';
  } else {
    repr = (value / 100).toFixed(2) + 'X';
  }
  return (
    <div className={`percent ` + className}>
      <span className="value">{repr}</span>
    </div>
  );
}

