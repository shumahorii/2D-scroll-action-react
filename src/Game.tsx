import React, { useEffect, useRef, useState } from 'react';

const Game: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const player = useRef({
        x: 50,
        y: 300,
        width: 30,
        height: 30,
        vx: 0,
        vy: 0,
        speed: 3,
        jumpPower: -10,
        isOnGround: false,
    });

    const enemy = useRef({
        x: 400,
        y: 300,
        width: 30,
        height: 30,
        vx: 2,
        direction: 1,
        leftLimit: 300,
        rightLimit: 500,
    });

    const blocks = useRef([
        { x: 200, y: 260, width: 100, height: 20 },
        { x: 400, y: 200, width: 120, height: 20 },
    ]);

    const keys = useRef<{ [key: string]: boolean }>({});
    const [isGameOver, setIsGameOver] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        const gravity = 0.5;
        const groundY = 330;

        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.key] = true;
            if ((e.key === 'ArrowUp' || e.key === ' ') && player.current.isOnGround) {
                player.current.vy = player.current.jumpPower;
                player.current.isOnGround = false;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keys.current[e.key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const checkCollision = () => {
            const p = player.current;
            const e = enemy.current;
            return (
                p.x < e.x + e.width &&
                p.x + p.width > e.x &&
                p.y < e.y + e.height &&
                p.y + p.height > e.y
            );
        };

        const loop = () => {
            if (isGameOver) return;

            const p = player.current;
            const e = enemy.current;

            // プレイヤーの移動
            if (keys.current['ArrowLeft']) {
                p.vx = -p.speed;
            } else if (keys.current['ArrowRight']) {
                p.vx = p.speed;
            } else {
                p.vx = 0;
            }

            p.vy += gravity;
            p.x += p.vx;
            p.y += p.vy;

            // 地面との接触
            if (p.y + p.height > groundY) {
                p.y = groundY - p.height;
                p.vy = 0;
                p.isOnGround = true;
            } else {
                p.isOnGround = false;
            }

            // ブロックとの当たり判定（上からだけ乗れる）
            for (const block of blocks.current) {
                const isAbove = p.y + p.height <= block.y + 5;
                const isWithinX = p.x + p.width > block.x && p.x < block.x + block.width;
                const isCollidingY = p.y + p.height + p.vy > block.y && p.y < block.y;

                if (isAbove && isWithinX && isCollidingY) {
                    p.y = block.y - p.height;
                    p.vy = 0;
                    p.isOnGround = true;
                }
            }

            // 敵の移動処理
            e.x += e.vx * e.direction;
            if (e.x <= e.leftLimit || e.x + e.width >= e.rightLimit) {
                e.direction *= -1;
            }

            // 当たり判定（敵）
            if (checkCollision()) {
                setIsGameOver(true);
            }

            // 描画
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'skyblue';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 地面
            ctx.fillStyle = 'green';
            ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

            // ブロック
            ctx.fillStyle = 'brown';
            for (const block of blocks.current) {
                ctx.fillRect(block.x, block.y, block.width, block.height);
            }

            // 敵
            ctx.fillStyle = 'black';
            ctx.fillRect(e.x, e.y, e.width, e.height);

            // プレイヤー
            ctx.fillStyle = 'red';
            ctx.fillRect(p.x, p.y, p.width, p.height);

            requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isGameOver]);

    return (
        <>
            <canvas ref={canvasRef} width={800} height={400} />
            {isGameOver && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '40px',
                    color: 'red',
                    fontWeight: 'bold',
                }}>
                    GAME OVER
                </div>
            )}
        </>
    );
};

export default Game;
