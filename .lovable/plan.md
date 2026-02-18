
# Fix PIP Image Zoom Clipping

## Problem
The PIP image is set to `width: 200%` and `height: 200%` to prevent rotation clipping, but this causes the image to appear cropped/zoomed-in even at the default scale of 1. The user sees a zoomed photo immediately after upload (as shown in the screenshot where Messi's head is cut off at the top).

## Solution
Change the PIP image sizing strategy: instead of using a fixed `200%` size, use `100%` as the base and only apply extra size via the user's scale control. The image should use `object-fit: contain` so the entire photo is visible by default within the PIP frame, fitting entirely inside without cropping.

## Technical Details

**File: `src/components/cortes/CortesCanvas.tsx`** (Lines 79-91)

Change the PIP image styles:
- Set `width: '100%'` and `height: '100%'` as base dimensions
- Change `objectFit` from `'cover'` to `'contain'` so the full image is visible inside the frame
- Keep the centering and transform logic for position/scale/rotation adjustments
- The user can still zoom in using the scale slider, but the default view shows the entire image

This means:
- Default scale (1x): full image visible inside PIP frame
- User zooms in via slider: image crops naturally as expected
- Rotation still works since the image can be scaled up to compensate
