'use client';
import { LaWalletConfig } from '@lawallet/react';

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LaWalletConfig>{children}</LaWalletConfig>;
}
