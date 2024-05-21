import { usePathname } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

// let currentViewTransition: null | [Promise<void>, () => void] = null;

export function useNativeTransition() {
  const pathName = usePathname();
  const currentPathNameRef = useRef(pathName);

  const [currentViewTransition, setCurrentViewTransition] = useState<
    null | [Promise<void>, () => void]
  >(null);

  useEffect(() => {
    if (!("startViewTransition" in document)) {
      console.log("Browser does not support 'viewTransitionApi'");
      return;
    }
    const onPopState = () => {
      let pendingViewTransitionResolve: () => void;

      const pendingViewTransition = new Promise<void>((resolve) => {
        pendingViewTransitionResolve = resolve;
      });

      const pendingStartViewTransition = new Promise<void>((resolve) => {
        // @ts-ignore
        document.startViewTransition(() => {
          resolve();
          return pendingViewTransition;
        });
      });

      setCurrentViewTransition([
        pendingStartViewTransition,
        pendingViewTransitionResolve!,
      ]);
    };
    window.addEventListener("popstate", onPopState);

    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (currentViewTransition && currentPathNameRef.current !== pathName) {
    use(currentViewTransition[0]);
  }

  const transitionRef = useRef(currentViewTransition);
  useEffect(() => {
    transitionRef.current = currentViewTransition;
  }, [currentViewTransition]);

  useEffect(() => {
    currentPathNameRef.current = pathName;
    if (transitionRef.current) {
      transitionRef.current[1]();
      transitionRef.current = null;
    }
  }, [pathName]);
}
