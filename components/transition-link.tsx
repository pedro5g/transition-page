"use client";

import { useFinishViewTransition } from "@/providers/view-transition-provider";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback } from "react";

type MouseEventType = React.MouseEvent<HTMLAnchorElement>;

function isModifiedEvent(e: React.MouseEvent<HTMLAnchorElement | SVGAElement>) {
  const eventTarget = e.currentTarget;
  const target = eventTarget.getAttribute("target");

  return (
    (target && target !== "_self") ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    (e.nativeEvent && e.nativeEvent.which === 2)
  );
}

function shouldPreserveDefault(e: MouseEventType) {
  const { nodeName } = e.currentTarget;
  const isAnchorNodeName = nodeName.toUpperCase() === "A";

  if (isAnchorNodeName && isModifiedEvent(e)) {
    return true;
  }

  return false;
}

export const Link = (props: React.ComponentProps<typeof NextLink>) => {
  const router = useRouter();
  const finishViewTransition = useFinishViewTransition();

  const { href, as, replace, scroll } = props;

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (props.onClick) {
        props.onClick(e);
      }

      if ("startViewTransition" in document) {
        if (shouldPreserveDefault(e)) {
          return;
        }

        e.preventDefault();

        // @ts-ignore
        document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              startTransition(() => {
                router[replace ? "replace" : "push"]((as || href) as string, {
                  scroll: scroll ?? true,
                });
                finishViewTransition(() => resolve);
              });
            })
        );
      }
    },
    [props.onClick, href, as, replace, scroll]
  );

  return <NextLink {...props} onClick={onClick} />;
};
