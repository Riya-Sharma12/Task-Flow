'use client';

export function CurrentDate() {
  return (
    <span className="hidden md:block">
      {new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
    </span>
  );
}
