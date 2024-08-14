import { config } from "@/config/config";

import { LaWalletConfig } from "@lawallet/react";
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LaWalletConfig config={config}>
      <Component {...pageProps} />
    </LaWalletConfig>
  );
}
