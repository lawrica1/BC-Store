import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Intent = "buy" | "service" | "ghost";

const intentStyles: Record<Intent, string> = {
  buy: "bg-gradient-to-r from-buyCyan to-buyBlue text-void shadow-cyanGlow hover:shadow-[0_0_42px_rgb(var(--buy-cyan)/0.28)]",
  service: "bg-serviceOrange text-white shadow-orangeGlow hover:shadow-[0_0_42px_rgb(var(--service-orange)/0.28)]",
  ghost: "border border-borderTech bg-[rgb(var(--glass-bg)/var(--glass-bg-opacity))] text-textMain hover:border-buyCyan/60"
};

interface SharedProps {
  children: ReactNode;
  intent?: Intent;
  className?: string;
}

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type LinkProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function NeonButton(props: ButtonProps | LinkProps) {
  const className = cn(
    "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-black transition duration-200 hover:-translate-y-0.5",
    intentStyles[props.intent ?? "buy"],
    props.className
  );

  if (typeof (props as LinkProps).href === "string") {
    const { href, intent: _intent, className: _ignoredClassName, ...rest } = props as LinkProps;
    return <Link href={href} className={className} {...rest} />;
  }

  const { intent: _intent, className: _ignoredClassName, ...rest } = props as ButtonProps;
  return <button className={className} {...rest} />;
}
