# Archetypes imagery

36 evocative images (12 signs × 3 registers: luminary / element / house).

## Editorial register — to follow strictly

- **Abstract evocation**, never literal illustration of the sign.
- Moodboard references: Aeon Magazine covers, Axel Hoedt photography, Hilma af Klint abstract painting.
- **Forbidden**: Pinterest new-age, commercial tarot card iconography, literal animals (rams, bulls, crabs, etc.), zodiac glyphs, stars-and-sparkles stock.

## Examples

- Soleil en Scorpion = dark water reflecting stars
- Lune en Cancer = interior of a shell bathed in milky light
- Ascendant Lion = threshold of a room flooded with honey-gold at dusk

## File layout

```
luminary/{sign-slug}.webp   # Sun / Moon / Asc chapter hero
element/{sign-slug}.webp    # Element balance visual
house/{sign-slug}.webp      # House chapter visual
```

Sign slugs: `belier, taureau, gemeaux, cancer, lion, vierge, balance, scorpion, sagittaire, capricorne, verseau, poissons`.

## Format

- WebP, 1600×900 (16:9), quality 85
- < 200 kB per image (target)
- Named exactly matching `SIGN_SLUGS` in [src/components/results/ArchetypeImage.tsx](../../../src/components/results/ArchetypeImage.tsx)

## Prompt template (SDXL / Midjourney)

> Abstract evocation of {archetype}, {element} light, {texture}, painterly, Hilma af Klint meets Axel Hoedt, muted palette with {accent_color}, 16:9, no humans, no literal animals, no zodiac symbols, cinematic, contemplative

Fill in `{archetype}`, `{element}`, `{texture}`, `{accent_color}` per sign register. Keep prompts standardized across the 36 images for visual cohesion.

## Status

Images to generate manually. The [ArchetypeImage component](../../../src/components/results/ArchetypeImage.tsx) already references the paths — missing files will 404 silently (component renders nothing if sign slug unknown; `next/image` handles 404s with blur placeholder).
