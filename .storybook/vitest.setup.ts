// This file is specifically asked for by Storybook in their Vitest documentation here:
// https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
//
// I am not entirely sure what it does.

import { setProjectAnnotations } from '@storybook/sveltekit';
import * as previewAnnotations from './preview';

setProjectAnnotations([previewAnnotations]);
process.env.STORYBOOK_VITEST = 'true';
