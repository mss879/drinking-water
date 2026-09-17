import { cloneElement, Fragment, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";

/**
 * Wraps every word of a heading in a clip mask (`.word-mask > .word`) so CSS can rise it into place.
 * Handles plain text and nested elements such as <Highlight>, and is safe in Server Components.
 * Pair with the `split` class plus `split-in` (animate now) or `data-split` (animate when scrolled into view).
 */
export function splitWords(node: ReactNode): ReactNode {
  let index = 0;

  const walk = (child: ReactNode, key: string): ReactNode => {
    if (typeof child === "string" || typeof child === "number") {
      return String(child)
        .split(/(\s+)/)
        .map((part, i) => {
          if (!part) return null;
          if (/^\s+$/.test(part)) return part;
          const n = index++;
          return (
            <span key={`${key}-${i}`} className="word-mask">
              <span className="word" style={{ "--i": n } as CSSProperties}>
                {part}
              </span>
            </span>
          );
        });
    }
    if (Array.isArray(child)) {
      return child.map((item, i) => <Fragment key={`${key}-${i}`}>{walk(item, `${key}-${i}`)}</Fragment>);
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children !== undefined) {
      return cloneElement(child as ReactElement<{ children?: ReactNode }>, undefined, walk(child.props.children, key));
    }
    return child;
  };

  return walk(node, "w");
}
