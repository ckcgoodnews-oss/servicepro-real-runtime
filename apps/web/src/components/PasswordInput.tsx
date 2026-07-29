'use client';

import { useState, type InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="password-input-wrap">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? '🙈' : '👁'}
      </button>
    </span>
  );
}
