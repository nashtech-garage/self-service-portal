import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import fetch from 'node-fetch';

export const createOrSkipVariableGroup = () =>
  createTemplateAction<{
    organization: string;
    project: string;
    groupName: string;
    token: string;
    variables?: Record<string, string>;
  }>({
    id: 'custom:create-or-skip-variable-group',
    description: 'Ensures a variable group exists in Azure DevOps; creates or updates it with variables.',
    schema: {
      input: {
        type: 'object',
        required: ['organization', 'project', 'groupName', 'token'],
        properties: {
          organization: { type: 'string' },
          project: { type: 'string' },
          groupName: { type: 'string' },
          token: { type: 'string' },
          variables: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
        },
      },
    },
    async handler(ctx) {
      const { organization, project, groupName, token, variables = {} } = ctx.input;
      const apiVersion = '7.1-preview.2';

      const getUrl = `https://dev.azure.com/${organization}/${project}/_apis/distributedtask/variablegroups?api-version=${apiVersion}`;
      const transformedVars = Object.entries(variables).reduce((acc, [key, value]) => {
        acc[key] = { value: String(value) };
        return acc;
      }, {} as Record<string, { value: string }>);

      ctx.logger.info(`🔎 Looking for existing variable group "${groupName}"`);

      // Helper to get project ID dynamically
      const getProjectId = async (): Promise<string> => {
        const url = `https://dev.azure.com/${organization}/_apis/projects/${project}?api-version=7.1`;

        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch project ID: ${await res.text()}`);
        }

        const data = await res.json() as { id: string };
        return data.id;
      };

      try {
        const res = await fetch(getUrl, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const body = await res.json() as {
          value?: Array<{ id: number; name: string; variables?: Record<string, { value: string }> }>
        };

        const existingGroup = body.value?.find(
          g => g.name.trim().toLowerCase() === groupName.trim().toLowerCase()
        );
        ctx.logger.debug(`🔍 Looking for groupName: "${groupName}"`);

        if (existingGroup) {
          const updateUrl = `https://dev.azure.com/${organization}/_apis/distributedtask/variablegroups/${existingGroup.id}?api-version=${apiVersion}`;
          ctx.logger.info(`✏️ Updating existing variable group "${groupName}"`);

          const updatePayload = {
            type: 'Vsts',
            name: groupName,
            variables: {
              ...(existingGroup.variables ?? {}),
              ...transformedVars,
            },
            variableGroupProjectReferences: [
              {
                name: groupName,
                projectReference: {
                  id: await getProjectId(),
                  name: project,
                },
              },
            ],
          };


          ctx.logger.info(`📦 Update Payload:\n${JSON.stringify(updatePayload, null, 2)}`);

          const updateRes = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatePayload),
          });

          if (!updateRes.ok) {
            throw new Error(`Failed to update variable group: ${await updateRes.text()}`);
          }

          ctx.logger.info(`✅ Variable group "${groupName}" updated.`);
        } else {
          const projectId = await getProjectId();

          const createPayload = {
            type: 'Vsts',
            name: groupName,
            variables: transformedVars,
            variableGroupProjectReferences: [
              {
                name: groupName,
                projectReference: {
                  id: projectId,
                  name: project,
                },
              },
            ],
          };

          ctx.logger.info(`🚀 Creating new variable group "${groupName}"`);
          ctx.logger.debug(`📦 Create Payload:\n${JSON.stringify(createPayload, null, 2)}`);

          const createRes = await fetch(getUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(createPayload),
          });

          if (!createRes.ok) {
            throw new Error(`Failed to create variable group: ${await createRes.text()}`);
          }

          ctx.logger.info(`🎉 Variable group "${groupName}" created.`);
        }
      } catch (err) {
        ctx.logger.error(`❌ Could not manage variable group: ${err instanceof Error ? err.message : String(err)}`);
        throw new Error(`Could not manage variable group: ${err}`);
      }
    },
  });
