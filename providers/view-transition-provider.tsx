"use client";

import { useNativeTransition } from "@/hooks/use-native-transition";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ViewTransitionContext = createContext<
  Dispatch<SetStateAction<null | (() => void)>>
>(() => () => {});

export const ViewTransitionProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [finishViewTransition, setFinishViewTransition] = useState<
    null | (() => void)
  >(null);

  useEffect(() => {
    if (finishViewTransition) {
      finishViewTransition();
      setFinishViewTransition(null);
    }
  }, [finishViewTransition]);

  useNativeTransition();

  return (
    <ViewTransitionContext.Provider value={setFinishViewTransition}>
      {children}
    </ViewTransitionContext.Provider>
  );
};

export function useFinishViewTransition() {
  const context = useContext(ViewTransitionContext);

  if (!context) {
    throw new Error("ViewTransitionProvider is required");
  }

  return context;
}
