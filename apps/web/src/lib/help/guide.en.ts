import type { GuideModule } from './types';
import { GUIDE_EN_PART1 } from './guide.en.part1';
import { GUIDE_EN_PART2 } from './guide.en.part2';

/**
 * English user guide = concatenation of the two translated batches.
 *
 * Unlike the FAQ, no category normalisation is needed here: the `.en.part*`
 * files already carry the canonical FRENCH `CategorieGuide` identifiers, which
 * is what the category filter and the FR/EN matching rely on. Only the display
 * is translated, by `libelleCategorieGuide()`.
 */
export const GUIDE_MODULES_EN: GuideModule[] = [...GUIDE_EN_PART1, ...GUIDE_EN_PART2];
