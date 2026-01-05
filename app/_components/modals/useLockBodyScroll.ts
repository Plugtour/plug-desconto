'use client';

import { useEffect, useRef } from 'react';

type SavedStyles = {
  htmlOverflow?: string;
  htmlOverscroll?: string;

  bodyOverflow?: string;
  bodyPosition?: string;
  bodyTop?: string;
  bodyLeft?: string;
  bodyRight?: string;
  bodyWidth?: string;
  bodyPaddingRight?: string;
};

function getScrollbarWidth() {
  // largura da barra (pra não dar “pulo” no layout)
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

export default function useLockBodyScroll(locked: boolean) {
  const saved = useRef<SavedStyles | null>(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const body = document.body;

    // salva estado atual 1x
    if (!saved.current) {
      saved.current = {
        htmlOverflow: html.style.overflow,
        htmlOverscroll: (html.style as any).overscrollBehavior,

        bodyOverflow: body.style.overflow,
        bodyPosition: body.style.position,
        bodyTop: body.style.top,
        bodyLeft: body.style.left,
        bodyRight: body.style.right,
        bodyWidth: body.style.width,
        bodyPaddingRight: body.style.paddingRight,
      };
    }

    // captura scroll atual
    scrollYRef.current = window.scrollY || window.pageYOffset || 0;

    // evita “pulo” ao sumir barra
    const sbw = getScrollbarWidth();
    const currentPr = parseFloat(window.getComputedStyle(body).paddingRight || '0') || 0;

    // trava fundo (robusto em iOS também)
    html.style.overflow = 'hidden';
    (html.style as any).overscrollBehavior = 'none';

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.paddingRight = `${currentPr + sbw}px`;

    return () => {
      // restaura tudo
      const s = saved.current;
      if (!s) return;

      html.style.overflow = s.htmlOverflow ?? '';
      (html.style as any).overscrollBehavior = s.htmlOverscroll ?? '';

      body.style.overflow = s.bodyOverflow ?? '';
      body.style.position = s.bodyPosition ?? '';
      body.style.top = s.bodyTop ?? '';
      body.style.left = s.bodyLeft ?? '';
      body.style.right = s.bodyRight ?? '';
      body.style.width = s.bodyWidth ?? '';
      body.style.paddingRight = s.bodyPaddingRight ?? '';

      // volta pro scroll anterior
      const y = scrollYRef.current || 0;
      window.scrollTo(0, y);

      saved.current = null;
    };
  }, [locked]);
}
