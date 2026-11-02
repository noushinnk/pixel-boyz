"use client";

import { useRouter } from 'next/navigation';
import { QuestsPage } from '@/views/QuestsPage';

export default function QuestsRoute() {
  const router = useRouter();
  return <QuestsPage navigate={(path) => router.push(path)} />;
}
