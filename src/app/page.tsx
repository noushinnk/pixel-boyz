"use client";

import { useRouter } from 'next/navigation';
import { HomePage } from '@/views/HomePage';

export default function Home() {
  const router = useRouter();
  return <HomePage navigate={(path) => router.push(path)} />;
}
