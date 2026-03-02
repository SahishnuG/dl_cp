"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  life: number; // for click-spawned particles
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Detect dark mode
    const isDark = () => document.documentElement.classList.contains("dark");

    // Color palette based on theme - more visible in light mode
    const getParticleColors = () => {
      if (isDark()) {
        return [
          "rgba(129, 140, 248, 0.6)", // indigo
          "rgba(244, 114, 182, 0.6)", // pink
          "rgba(52, 211, 153, 0.6)", // emerald
        ];
      }
      return [
        "rgba(99, 102, 241, 0.8)", // indigo - more opaque
        "rgba(236, 72, 153, 0.8)", // pink - more opaque
        "rgba(16, 185, 129, 0.8)", // emerald - more opaque
      ];
    };

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.floor(
        (canvas.width * canvas.height) / 12000 // slightly more particles
      );
      const colors = getParticleColors();

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: Math.random() * 2 + 1, // slightly larger
          opacity: Math.random() * 0.5 + 0.5, // higher baseline opacity
          color: colors[Math.floor(Math.random() * colors.length)],
          life: Infinity, // persistent particles
        });
      }
    };

    initParticles();

    // Spawn particles on click
    const handleClick = (e: MouseEvent) => {
      const colors = getParticleColors();
      const particleCount = 25;

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 3 + Math.random() * 4;

        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 1.5 + 1,
          opacity: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 120, // 2 seconds at 60fps
        });
      }
    };

    // Mouse move listener
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        // Decrease life for click-spawned particles
        if (particle.life !== Infinity) {
          particle.life--;
          if (particle.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          // Fade out as life decreases
          particle.opacity *= 0.97;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Mouse interaction - repel particles
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = 200;

        if (distance < minDistance) {
          const angle = Math.atan2(dy, dx);
          const force = (minDistance - distance) / minDistance;
          particle.vx -= Math.cos(angle) * force * 3;
          particle.vy -= Math.sin(angle) * force * 3;
        }

        // Apply friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw glow effect for more visibility
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = particle.opacity * 0.3;
        ctx.stroke();
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (1 - distance / 150) * 0.3;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      initParticles();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none cursor-crosshair"
      style={{ zIndex: -1, top: 0, left: 0 }}
    />
  );
}
