import { JsonObject } from '@backstage/types';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export const flattenParameterGroup = () =>
  createTemplateAction<{
    group?: JsonObject; // Changed type to optional
  }>({
    id: 'util:flatten-parameter-group',
    description:
      'Flattens a group of parameters into Record<string, string>, coercing all values to strings.',
    schema: {
      input: {
        type: 'object',
        // The 'group' property is no longer required.
        properties: {
          group: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    },
    async handler(ctx) {
      // De-structure with a default value to handle undefined gracefully
      const { group: rawGroup = {} } = ctx.input;

      if (!rawGroup || Object.keys(rawGroup).length === 0) {
        ctx.logger.warn('⚠️ Input group is undefined, null, or empty. Skipping variable group creation.');
        ctx.output('flattened', {}); // Output an empty object to prevent downstream errors
        return;
      }

      const flattened: Record<string, string> = {};

      for (const [key, value] of Object.entries(rawGroup)) {
        if (value === undefined || value === null) continue;

        // Coerce all types to string
        flattened[key] =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
      }

      ctx.logger.info(`✅ Flattened ${Object.keys(flattened).length} values.`);
      for (const [key, value] of Object.entries(flattened)) {
        ctx.logger.info(`   🔹 ${key}: ${value}`);
      }

      ctx.output('flattened', flattened);
    },
  });