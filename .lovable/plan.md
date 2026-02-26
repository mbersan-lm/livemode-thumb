

## Plan: Add delete button for photos in Thumb Principal (Geral CazéTv / Brasil)

### Changes

**1. `src/components/cortes/CortesThumbBuilder.tsx`**
- Add 4 new clear callbacks: `handleClearPerson`, `handleClearPerson2`, `handleClearPerson3`, `handleClearPerson4` — each sets the respective cutout to `null` and resets its transform
- Pass them to `CortesControls` as `onClearPerson`, `onClearPerson2`, `onClearPerson3`, `onClearPerson4`

**2. `src/components/cortes/CortesControls.tsx`**
- Add the 4 new optional props to the interface
- In the "Thumb Principal — free photo uploads" section (lines ~1662-1689), add a trash icon button next to each photo slot when a cutout exists
- The button calls the corresponding `onClearPerson` callback to remove the photo, allowing re-upload

The trash button will appear inline next to the "Trocar foto" button, styled consistently with existing icon buttons in the UI.

