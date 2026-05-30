"use client";

import { useState, forwardRef } from "react";
import Link from "next/link";

const COLORS = {
  default:     { fg: "#f0f0e8", bg: "#0a0a0a" },
  accent:      { fg: "#00ffd5", bg: "#0a0a0a" },
  destructive: { fg: "#ef4444", bg: "#0a0a0a" },
};

export type ButtonVariant = "default" | "accent" | "destructive";

interface BaseProps {
  variant?: ButtonVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

interface ButtonAsButton extends BaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  as?: "button";
  href?: never;
}

interface ButtonAsLink extends BaseProps {
  as: "link";
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

function getStyles(variant: ButtonVariant, hover: boolean, active: boolean): React.CSSProperties {
  const { fg } = COLORS[variant];
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "10px 22px",
    fontFamily: "'Satoshi', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    textDecoration: "none",
    border: `2px solid ${fg}`,
    borderRadius: 0,
    cursor: "pointer",
    transition: "all 120ms ease",
    whiteSpace: "nowrap",
    userSelect: "none",
    lineHeight: 1,
  };

  if (active) {
    return { ...base, background: fg, color: "#0a0a0a", boxShadow: "none", transform: "translate(4px, 4px)" };
  }
  if (hover) {
    return { ...base, background: fg, color: "#0a0a0a", boxShadow: "none", transform: "translate(2px, 2px)" };
  }
  return { ...base, background: "transparent", color: fg, boxShadow: `4px 4px 0px ${fg}` };
}

const ComicButton = forwardRef<HTMLButtonElement, ButtonProps>(function ComicButton(props, ref) {
  const { variant = "default", children, style, className, ...rest } = props;
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const computedStyle = { ...getStyles(variant, hover, active), ...style };

  if (props.as === "link") {
    const { href, target, rel, onClick } = props as ButtonAsLink;
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        style={computedStyle}
        className={className}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); setActive(false); }}
        onMouseDown={() => setActive(true)}
        onMouseUp={() => setActive(false)}
      >
        {children}
      </Link>
    );
  }

  const { as: _as, href: _href, ...buttonRest } = rest as any;
  return (
    <button
      ref={ref}
      {...buttonRest}
      style={computedStyle}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {children}
    </button>
  );
});

export default ComicButton;

/** Utility: get the raw style object for a given variant + state.
 *  Use this in files that render <button style={...}> directly. */
export function comicButtonStyle(
  variant: ButtonVariant = "default",
  state: "default" | "hover" | "active" = "default"
): React.CSSProperties {
  return getStyles(variant, state === "hover", state === "active");
}
