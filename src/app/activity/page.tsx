"use client";

import { useRouter } from 'next/navigation';
import { ActivityPage } from '@/views/ActivityPage';

export default function ActivityRoute() {
  const router = useRouter();
  return <ActivityPage navigate={(path) => router.push(path)} />;
}
