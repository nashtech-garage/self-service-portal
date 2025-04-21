import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import axios from 'axios';

export const getRepoIdAction = () =>
  createTemplateAction<{
    organization: string;
    project: string;
    repository: string;
    personalAccessToken: string;
  }>({
    id: 'azure:get-repo-id',
    description: 'Fetch the repository ID from Azure DevOps',
    schema: {
      input: {
        type: 'object',
        required: ['organization', 'project', 'repository', 'personalAccessToken'],
        properties: {
          organization: {
            type: 'string',
            description: 'Azure DevOps organization name',
          },
          project: {
            type: 'string',
            description: 'Azure DevOps project name',
          },
          repository: {
            type: 'string',
            description: 'Azure DevOps repository name',
          },
          personalAccessToken: {
            type: 'string',
            description: 'Azure DevOps Personal Access Token (PAT)',
          },
        },
      },
    },
    async handler(ctx) {
      const { organization, project, repository, personalAccessToken } = ctx.input;
      const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repository}?api-version=7.0`;

      try {
        ctx.logger.info(`Fetching repository ID from Azure DevOps for repository: ${repository}`);

        // Call Azure DevOps API
        const response = await axios.get(url, {
          headers: {
            Authorization: `Basic ${Buffer.from(`:${personalAccessToken}`).toString('base64')}`,
          },
        });

        // Extract and log the repository ID
        const repositoryId = response.data.id;
        ctx.logger.info(`Successfully fetched repository ID: ${repositoryId}`);

        // Output the repository ID for the template
        ctx.output('repositoryId', repositoryId);
      } catch (error) {
        if (error instanceof Error) {
          ctx.logger.error(`Error fetching repository ID: ${error.message}`);
          throw new Error(`Could not retrieve repository ID: ${error.message}`);
        }
        ctx.logger.error(`Unknown error occurred: ${error}`);
        throw new Error('An unknown error occurred while fetching the repository ID.');
      }
    },
  });
