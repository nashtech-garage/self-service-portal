import fetch from 'node-fetch'; // Ensure you import fetch for HTTP requests

/**
 * Fetches the repository ID from Azure DevOps based on the base URL.
 * @param {string} baseUrl - The Azure DevOps repository base URL (e.g., https://dev.azure.com/my-org/my-project/_git/my-repo).
 * @param {string} token - The Azure DevOps Personal Access Token (PAT).
 * @returns {Promise<string>} - The repository ID.
 */
export const fetchRepositoryId = async (baseUrl: string, token: string): Promise<string> => {
  // Parse the base URL to extract organization, project, and repository name
  const url = new URL(baseUrl);

  if (url.host !== 'dev.azure.com') {
    throw new Error(`Unsupported base URL host: ${url.host}`);
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  const organization = pathParts[0]; // First part of the path is the organization
  const project = pathParts[1];      // Second part is the project name
  const repositoryName = pathParts[3]; // Fourth part is the repository name

  // Build the Azure DevOps API URL for repositories
  const apiUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories?api-version=6.0`;

  // Make the HTTP request to fetch repositories
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Use the PAT for authentication
    },
  });

  // Handle API errors
  if (!response.ok) {
    throw new Error(
      `Failed to fetch repositories. Status: ${response.status}, Message: ${await response.text()}`
    );
  }

  const data = await response.json();

  // Search for the repository by name
  const repository = data.value.find((repo: any) => repo.name === repositoryName);

  // If the repository is not found, throw an error
  if (!repository) {
    throw new Error(
      `Repository '${repositoryName}' not found in project '${project}' within organization '${organization}'`
    );
  }

  // Return the repository ID
  return repository.id;
};
