import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export const createGetSecretAction = () => {
  return createTemplateAction<{ secretKey: string }>({
    id: 'custom:get-secret',
    description: 'Retrieves an environment variable as a secret',
    schema: {
      input: {
        type: 'object',
        required: ['secretKey'],
        properties: {
          secretKey: {
            type: 'string',
            description: 'The name of the environment variable to retrieve',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            description: 'The retrieved secret value',
          },
        },
      },
    },
    async handler(ctx) {
      const secretValue = process.env[ctx.input.secretKey];
       
      if (!secretValue) {
        throw new Error(`Environment variable ${ctx.input.secretKey} is not set`);
      }
  
      ctx.output('value', secretValue);

    },
  });
};
