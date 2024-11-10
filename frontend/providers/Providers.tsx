"use client";

import { PropsWithChildren } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { AuthProvider } from "./AuthProvider";
import { DFXProvider } from "./DFXProvider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ReduxProvider store={store}>
      <DFXProvider>
        <AuthProvider>{children}</AuthProvider>
      </DFXProvider>
    </ReduxProvider>
  );
}
