

# Fix: Thumb Principal preview images compressed

## Root Cause

Tailwind CSS Preflight applies `img { max-width: 100%; height: auto; }` to all images globally. In the Thumb Principal quadrants:

- Each quadrant container is 640x360px (50% of 1280x720)
- Images are styled with `height: '211.2%'` = 760px tall, `width: 'auto'`
- Tailwind's `max-width: 100%` caps image width at 640px (container width)
- This breaks the natural aspect ratio, making images appear **horizontally compressed**

The export (Canvas API) calculates width correctly via `drawH * (naturalWidth / naturalHeight)`, so it's unaffected.

## Fix

**File: `src/components/cortes/CortesCanvas.tsx`** (line ~464)

Add `maxWidth: 'none'` to the quadrant image style to override Tailwind's Preflight:

```diff
  <img
    src={c.src}
    alt=""
    style={{
      position: 'absolute',
      left: (i === 0 || i === 2) ? -20 : 40,
      top: 0,
      height: '211.2%',
      width: 'auto',
+     maxWidth: 'none',
      transform: `translate(${c.t.x}px, ${c.t.y}px) scale(${c.t.scale}) rotate(${c.t.rotation}deg)`,
      transformOrigin: '0 0',
    }}
  />
```

Single line addition. No other files affected.

