/**
 * Shared configuration and media-query flags.
 * Centralises values that multiple modules depend on so they
 * are only evaluated once, at import time.
 */

export const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

export const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
).matches;
