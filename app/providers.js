'use client';

import { LangProvider } from './i18n';

export function Providers({ children }) {
  return <LangProvider>{children}</LangProvider>;
}
