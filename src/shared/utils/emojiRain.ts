/**
 * Emoji rain effect: animated emoji particles falling from top to bottom.
 */

interface EmojiRainOptions {
  emoji: string;
  duration?: number;
  particleCount?: number;
  fallDuration?: number;
}

export function createEmojiRain(options: EmojiRainOptions): void {
  const { emoji, duration = 2000, particleCount = 30, fallDuration = 2500 } = options;

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50;
  `;
  document.body.appendChild(container);

  const particles: HTMLElement[] = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const xStart = Math.random() * 100;
    const delay = (i / particleCount) * duration;
    const size = 24 + Math.random() * 16;
    const rotation = Math.random() * 360;
    const xOffset = (Math.random() - 0.5) * 100;

    particle.textContent = emoji;
    particle.style.cssText = `
      position: absolute;
      left: ${xStart}%;
      top: -50px;
      font-size: ${size}px;
      line-height: 1;
      opacity: 1;
      animation: emojiRainFall ${fallDuration}ms ease-in forwards;
      animation-delay: ${delay}ms;
      transform: translateX(${xOffset}px) rotate(${rotation}deg);
    `;

    container.appendChild(particle);
    particles.push(particle);
  }

  // Inject animation keyframes if not already present
  if (!document.getElementById('emoji-rain-keyframes')) {
    const style = document.createElement('style');
    style.id = 'emoji-rain-keyframes';
    style.textContent = `
      @keyframes emojiRainFall {
        0% {
          top: -50px;
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          top: 100vh;
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Clean up after animation finishes
  setTimeout(() => {
    container.remove();
  }, duration + fallDuration);
}
