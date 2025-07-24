import { JsonObject } from '@backstage/types';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export const flattenParameterGroup = () =>
  createTemplateAction<{
    group: JsonObject;
  }>({
    id: 'util:flatten-parameter-group',
    description:
      'Flattens a group of parameters into Record<string, string>, coercing all values to strings.',
    schema: {
      input: {
        type: 'object',
        required: ['group'],
        properties: {
          group: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    },
    async handler(ctx) {
      const rawGroup = ctx.input.group;
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
