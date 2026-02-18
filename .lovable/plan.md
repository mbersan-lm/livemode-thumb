
# Fix PIP Image Rotation Clipping

## Problem
When rotating the PIP image, corners get clipped (as shown in the screenshot). This happens because `object-fit: cover` sizes the image to exactly fill the container, then `transform: rotate()` is applied, but `overflow: hidden` clips the rotated corners.

## Solution
Replace `object-fit: cover` with a manual approach: make the image significantly larger than the container (200% width/height) and center it using `translate`. This guarantees the image always covers the container even when rotated, without relying on `object-fit`.

## Technical Details

**File: `src/components/cortes/CortesCanvas.tsx`** (Lines 76-97)

Replace the PIP image rendering with:
- Remove `object-fit: cover` and `object-position`
- Set the image to `width: 200%`, `height: 200%` (oversized to prevent corner exposure)
- Position at `left: 50%`, `top: 50%` with `translate(-50%, -50%)` to center it
- Apply user's X/Y offset, scale, and rotation on top of the centering transform
- Keep the `coverScale` compensation for extreme rotation angles
- The container's `overflow: hidden` will naturally crop the oversized image to the PIP frame boundaries

This approach ensures the image always fills the PIP frame regardless of rotation angle, scale, or position adjustments.
