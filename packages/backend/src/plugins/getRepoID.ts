import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import axios from 'axios';

export const getRepoIdAction = () =>
  createTemplateAction<{
    organization: string;
    project: string;
    repositoryName: string;
    personalAccessToken: string;
  }>({
    id: 'azure:get-repo-id',
    description: 'Fetch the repository ID from Azure DevOps',
    schema: {
      input: {
        type: 'object',
        required: ['organization', 'project', 'repositoryName'],
        properties: {
          organization: {
            type: 'string',
            description: 'Azure DevOps organization name',
          },
          project: {
            type: 'string',
            description: 'Azure DevOps project name',
          },
          repositoryName: {
            type: 'string',
            description: 'Azure DevOps repository name',
          },
        },
      },
    },
    async handler(ctx) {
      const { organization, project, repositoryName } = ctx.input;
      // const personalAccessToken = '1nEwHaOjLYkT0GOohAKnf4orlRpynEwiJIuNp9kRmgdu9NSbiFL2JQQJ99BEACAAAAAAAAAAAAASAZDO205E'
      const personalAccessToken = process.env.AZURE_DEVOPS_PAT;
      const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repositoryName}?api-version=7.0`;
      ctx.logger.info(`Repository Name Being Queried: ${repositoryName}`);
      ctx.logger.info(`Requesting URL: ${url}`);
      ctx.logger.info(`Using PAT: ${personalAccessToken ? 'Loaded' : 'Not Found'}`);

      try {
        ctx.logger.info(`Fetching repository ID from Azure DevOps for repository: ${repositoryName}`);

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
