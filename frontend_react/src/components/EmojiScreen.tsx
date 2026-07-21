import { useEffect, useRef } from 'react'

interface Props {
    showEmojis: boolean;
    duration?: number;
    onClose: () => void;
}

interface EmojiProps {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    label: string;
    rotation: number;
    rotationSpeed: number;
    bounces: number;
    MAX_BOUNCES: number;
    update: () => void;
    draw: () => void;
    isOut: () => boolean;
}

const EmojiScreen = ({ showEmojis, duration = 10000, onClose} : Props) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!showEmojis) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const emoji = "🔥";
        let emojiObjects: Emoji[] = [];

        const gravity = 0.3;
        const bounce = 0.6;
        const friction = 0.98;

        class Emoji implements EmojiProps {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            label: string;
            rotation: number;
            rotationSpeed: number;
            bounces: number;
            MAX_BOUNCES: number;

            constructor() {
                this.x = Math.random() * (canvas!.width - 50) + 25;
                this.y = 0;
                this.vx = (Math.random() - 0.5) * 8;
                this.vy = Math.random() * 2 + 1;
                this.size = Math.random() * 24 + 20;
                this.label = emoji;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.05;
                this.bounces = 0;
                this.MAX_BOUNCES = 1;
            }

            update(): void {
                this.vy += gravity;
                this.vx *= friction;
                this.x += this.vx;
                this.y += this.vy;
                this.rotation += this.rotationSpeed;

                if (this.x - this.size / 2 < 0 || this.x + this.size / 2 > canvas!.width) {
                    this.vx = -this.vx * bounce;
                    this.x = this.x < canvas!.width / 2 ? this.size / 2 : canvas!.width - this.size / 2;
                }

                if ((this.bounces < this.MAX_BOUNCES) && (this.y + this.size / 2 > canvas!.height)) {
                    this.bounces++;
                    this.vy = -this.vy * bounce / (this.size / 30);
                    this.y = canvas!.height - this.size / 2;
                    this.vx *= 0.8;
                }
            }

            draw(): void {
                ctx!.save();
                ctx!.translate(this.x, this.y);
                ctx!.rotate(this.rotation);
                ctx!.font = `${this.size}px Arial`;
                ctx!.textAlign = 'center';
                ctx!.textBaseline = 'middle';
                ctx!.fillText(this.label, 0, 0);
                ctx!.restore();
            }

            isOut(): boolean {
                return ((this.y - this.size) / 2) > canvas!.height;
            }
        }

        let spawnTimer = 0;
        const spawnInterval = 10;
        let animationFrameId: number;

        let isSpawning = true;
        const stopSpawningTimeout = setTimeout(() => {
            isSpawning = false;
        }, duration - 1500);

        const endAnimationTimeout = setTimeout(() => {
            if (onClose) onClose();
        }, duration);

        const animate = (): void => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isSpawning) {
            spawnTimer++;
            if (spawnTimer % spawnInterval === 0) {
                emojiObjects.push(new Emoji());
            }
        }

        for (let i = emojiObjects.length - 1; i >= 0; i--) {
            const obj = emojiObjects[i];
            obj.update();
            obj.draw();

            if (obj.isOut()) {
                emojiObjects.splice(i, 1);
            }
        }

        animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = (): void => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            clearTimeout(stopSpawningTimeout);
            clearTimeout(endAnimationTimeout);
            window.removeEventListener('resize', handleResize);
        };
    }, [showEmojis, duration, onClose])

    if (!showEmojis) return null;
    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    )
}

export default EmojiScreen