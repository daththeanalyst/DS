"use client";

import { useRef, ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollReveal({ 
  children, 
  className,
  stagger = false,
  yOffset = 50,
}: { 
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  yOffset?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    const targets = stagger 
      ? containerRef.current.children 
      : containerRef.current;

    gsap.fromTo(
      targets,
      { 
        y: yOffset, 
        opacity: 0,
        rotationX: 10,
        transformOrigin: "top"
      },
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 1,
        ease: "power3.out",
        stagger: stagger ? 0.1 : 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%", // Starts when top of element hits 85% of viewport
          toggleActions: "play none none reverse", // Play on enter, reverse on leave back
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={className} style={{ perspective: '1000px' }}>
      {children}
    </div>
  );
}
