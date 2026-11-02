"use client";

import { useRouter } from 'next/navigation';
import { ForgePage } from '@/views/ForgePage';

export default function ForgeRoute() {
  const router = useRouter();
  return <ForgePage navigate={(path) => router.push(path)} />;
}
