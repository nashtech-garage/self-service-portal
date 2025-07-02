import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import fetch from 'node-fetch';

export const createOrSkipVariableGroup = () =>
  createTemplateAction<{
    organization: string;
    project: string;
    groupName: string;
    token: string;
  }>({
    id: 'custom:create-or-skip-variable-group',
    description: 'Ensures a variable group exists in Azure DevOps; creates it if missing.',
    schema: {
      input: {
        type: 'object',
        required: ['organization', 'project', 'groupName', 'token'],
        properties: {
          organization: {
            type: 'string',
            description: 'Azure DevOps organization name',
          },
          project: {
            type: 'string',
            description: 'Azure DevOps project name',
          },
          groupName: {
            type: 'string',
            description: 'Name of the variable group to ensure',
          },
          token: {
            type: 'string',
            description: 'Azure DevOps Bearer token',
          },
        },
      },
    },
    async handler(ctx) {
      const { organization, project, groupName, token } = ctx.input;
      ctx.logger.info(`organization: ${organization} `);
      const url = `https://dev.azure.com/${organization}/${project}/_apis/distributedtask/variablegroups?api-version=7.1-preview.2`;

      ctx.logger.info(`🔎 Checking for existing variable group: "${groupName}"`);
      ctx.logger.debug(`GET ${url}`);

      try {
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const body = (await res.json()) as { value?: { name: string }[] };

        const exists = body.value?.some(group => group.name === groupName);
        if (exists) {
          ctx.logger.info(`✅ Variable group "${groupName}" already exists. Skipping creation.`);
          return;
        }

        ctx.logger.info(`🚀 Creating variable group "${groupName}"`);

        const payload = {
          type: 'Vsts',
          name: groupName,
          variables: {},
        };

        const createRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!createRes.ok) {
          const errText = await createRes.text();
          throw new Error(`Failed to create variable group: ${errText}`);
        }

        ctx.logger.info(`🎉 Variable group "${groupName}" created successfully.`);
      } catch (error) {
        if (error instanceof Error) {
          ctx.logger.error(`Error during variable group operation: ${error.message}`);
          throw new Error(`Could not manage variable group: ${error.message}`);
        }
        ctx.logger.error(`Unknown error: ${error}`);
        throw new Error('An unknown error occurred while creating the variable group.');
      }
    },
  });
