import { JsonObject } from '@backstage/types';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export const flattenParameterGroup = () =>
  createTemplateAction<{
    group?: JsonObject;
  }>({
    id: 'util:flatten-parameter-group',
    description:
      'Flattens a group of parameters into Record<string, string>, coercing all values to strings.',
    schema: {
      input: {
        type: 'object',
        properties: {
          group: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    },
    async handler(ctx) {
      const { group: rawGroup = {} } = ctx.input;

      if (!rawGroup || Object.keys(rawGroup).length === 0) {
        ctx.logger.warn('⚠️ Input group is undefined, null, or empty. Skipping variable group creation.');
        ctx.output('flattened', {});
        return;
      }

      const flattened: Record<string, string> = {};

      for (const [key, value] of Object.entries(rawGroup)) {
        if (value === undefined || value === null) continue;

        // --- UPDATED LOGIC HERE ---
        // 1. Check if the value is an array
        if (Array.isArray(value)) {
          // Join the array elements into a comma-separated string
          flattened[key] = value.join(', ');
        }
        // 2. Otherwise, if it's another type of object, stringify it
        else if (typeof value === 'object') {
          flattened[key] = JSON.stringify(value);
        }
        // 3. Otherwise, just coerce it to a string
        else {
          flattened[key] = String(value);
        }
        // --- END OF UPDATED LOGIC ---
      }

      ctx.logger.info(`✅ Flattened ${Object.keys(flattened).length} values.`);
      for (const [key, value] of Object.entries(flattened)) {
        ctx.logger.info(`   🔹 ${key}: ${value}`);
      }

      ctx.output('flattened', flattened);
    },
  });