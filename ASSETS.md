# Asset Inventory & Generation Guide

## Currently Used
| File | Size | Description |
|------|------|-------------|
| `/public/profile-new.webp` | 153 KB | Profile photo (used for particle portrait sampling) |
| `/public/profile-new.jpg` | 2.5 MB | Full-res profile photo |
| `/public/welcome-poster.webp` | 24 KB | WelcomeIntro background still |

## Assets to Add (Optional Upgrades)

### `/public/portrait-cutout.png`
- **Size**: ~720×830, transparent background
- **Purpose**: Head-and-shoulders cutout for sharper particle portrait shape
- **How to create**: Remove background from profile-new.jpg using remove.bg or Photoshop
- **Without it**: The particle effect samples all pixels from profile-new.webp; works but includes background

### `/public/models/me.glb`
- **Size**: < 5 MB, Draco-compressed
- **Purpose**: Rigged full-body avatar for high-fidelity 3D character
- **How to create**:
  1. Upload selfie to [MetaPerson Creator](https://metaperson.avatarsdk.com/)
  2. Export as GLB with skeleton
  3. Upload to [Mixamo](https://www.mixamo.com/), apply "Sitting Idle" or "Typing" animation
  4. Re-export as GLB, compress with `gltf-transform optimize`
- **Without it**: Uses the existing geometric primitives (capsules, spheres, boxes)

### `/public/room-laptop.webp`
- **Size**: 2400×1500
- **Purpose**: Photographic dark room backdrop for the laptop zoom intro
- **Generation prompt**: *"Cinematic photo of an open silver laptop on a wooden desk in a dark room, warm orange desk lamp glowing from above casting volumetric light, shallow depth of field, moody film grain, 3:2 aspect ratio, editorial photography"*
- **Without it**: Uses the existing CSS-built room (gradients + div laptop)

### `/public/scene-bg.webp`
- **Size**: 2400×1350
- **Purpose**: Illustrated park background for the hero scene
- **Generation prompt**: *"Pixar-style 3D render of a sunny park scene, golden hour lighting, soft green trees, hazy city skyline in the background, blue sky with gentle clouds, warm depth of field, stylized illustration, 16:9"*
- **Without it**: Uses the existing CSS/div park backdrop

### Avatar Generation Prompt
*"Pixar-style 3D render of a young Indian software engineer with dark curly hair, black rectangular glasses and a warm friendly smile, sitting at a wooden table with an open silver laptop in a sunny park, wearing a blue hoodie, golden hour light, soft depth of field, trees and a hazy city skyline behind, high detail, friendly approachable expression, 16:9"*
