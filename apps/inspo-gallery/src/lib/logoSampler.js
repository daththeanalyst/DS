// logoSampler.js
// Loads a PNG from /public, paints it to an offscreen canvas, and samples pixel positions
// where the letterform is present (bright pixels on the DS2 logo). Returns normalized
// coordinates in [-0.5, 0.5] × [-0.5, 0.5]*aspect for use in WebGL / canvas variants.

const cache = new Map();

export function sampleLogo(src, { step = 4, threshold = 160, targetWidth = 1200 } = {}) {
    const key = `${src}|${step}|${threshold}|${targetWidth}`;
    if (cache.has(key)) return cache.get(key);

    const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const ratio = img.width / img.height;
            const W = targetWidth;
            const H = Math.round(W / ratio);
            const cv = document.createElement('canvas');
            cv.width = W;
            cv.height = H;
            const ctx = cv.getContext('2d');
            ctx.drawImage(img, 0, 0, W, H);
            const data = ctx.getImageData(0, 0, W, H).data;

            const points = [];
            const grid = new Uint8Array(W * H); // brightness mask
            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    const i = (y * W + x) * 4;
                    // assume black-bg, white logo: brightness = avg rgb weighted by alpha
                    const a = data[i + 3] / 255;
                    const br = ((data[i] + data[i + 1] + data[i + 2]) / 3) * a;
                    grid[y * W + x] = br > threshold ? 255 : 0;
                }
            }

            for (let y = 0; y < H; y += step) {
                for (let x = 0; x < W; x += step) {
                    if (grid[y * W + x]) {
                        // normalize to -0.5..0.5 on x, keep aspect on y
                        const nx = x / W - 0.5;
                        const ny = -(y / H - 0.5) / ratio;
                        points.push(nx, ny);
                    }
                }
            }

            resolve({
                positions: new Float32Array(points),
                count: points.length / 2,
                width: W,
                height: H,
                aspect: ratio,
                brightness: grid,
            });
        };
        img.onerror = reject;
        img.src = src;
    });

    cache.set(key, promise);
    return promise;
}

// Sample brightness at a normalized x,y position (0..1 on both axes, top-left origin)
export function sampleBrightness(sample, u, v) {
    const { width, height, brightness } = sample;
    const x = Math.min(width - 1, Math.max(0, Math.floor(u * width)));
    const y = Math.min(height - 1, Math.max(0, Math.floor(v * height)));
    return brightness[y * width + x];
}
