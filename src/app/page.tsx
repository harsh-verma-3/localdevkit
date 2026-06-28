import type { Metadata } from 'next';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = {
  title: 'DevUtility — Privacy-First Developer Toolbox',
  description:
    'Free browser-based tools for developers. JSON formatter, Base64 encoder, JWT decoder, password generator, and more. Everything runs locally — your data never leaves your device.',
};

export default function HomePage() {
  return <DashboardClient />;
}
