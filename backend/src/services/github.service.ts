/*
- [ ] Create GitHub API client (src/services/github.service.ts)
- [ ] Implement fetchUserRepos(accessToken) - fetch all repos from GitHub
- [ ] Implement fetchRepoDetails(owner, repo, accessToken) - get single repo
- [ ] Handle GitHub API rate limiting
- [ ] Add error handling for API failures
*/ 

import axios from 'axios';

const fetchUserRepos = async (accessToken: string) => {
    const response = await axios.get('https://api.github.com/user/repos', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

const fetchRepoDetails = async (owner: string, repo: string, accessToken: string) => {
    const responce = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return responce.data;
}

export { fetchUserRepos, fetchRepoDetails };