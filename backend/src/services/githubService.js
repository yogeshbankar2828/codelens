const axios = require('axios');

class GitHubService {
  constructor(accessToken) {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  }

  /**
   * Get all PRs for a repository
   */
  async getPullRequests(owner, repo, state = 'open', page = 1, perPage = 30) {
    const { data } = await this.client.get(`/repos/${owner}/${repo}/pulls`, {
      params: { state, page, per_page: perPage },
    });
    return data;
  }

  /**
   * Get a single PR
   */
  async getPullRequest(owner, repo, prNumber) {
    const { data } = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}`);
    return data;
  }

  /**
   * Get the unified diff for a PR
   */
  async getPullRequestDiff(owner, repo, prNumber) {
    const { data } = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}`, {
      headers: { Accept: 'application/vnd.github.v3.diff' },
    });
    return data;
  }

  /**
   * Get list of files changed in a PR
   */
  async getPullRequestFiles(owner, repo, prNumber) {
    const { data } = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}/files`);
    return data;
  }

  /**
   * Get repository tree (all file paths)
   */
  async getRepoTree(owner, repo, treeSha = 'HEAD') {
    const { data } = await this.client.get(
      `/repos/${owner}/${repo}/git/trees/${treeSha}`,
      { params: { recursive: 1 } }
    );
    return data.tree || [];
  }

  /**
   * Get raw file content from a repo
   */
  async getFileContent(owner, repo, filePath, ref = 'HEAD') {
    try {
      const { data } = await this.client.get(`/repos/${owner}/${repo}/contents/${filePath}`, {
        params: { ref },
      });
      if (data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return data.content || '';
    } catch {
      return null;
    }
  }

  /**
   * List repositories for the authenticated user
   */
  async getUserRepos() {
    const { data } = await this.client.get('/user/repos', {
      params: { sort: 'updated', per_page: 100, type: 'all' },
    });
    return data;
  }

  /**
   * Get authenticated user profile
   */
  async getAuthenticatedUser() {
    const { data } = await this.client.get('/user');
    return data;
  }
}

module.exports = GitHubService;
