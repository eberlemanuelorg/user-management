const core = require('@actions/core');
const github = require('@actions/github');
const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
const yaml = require('js-yaml');

try {
    const adminTeamSlug = "admin";
    const approveMessage = "approved";

    const commentAuthor = github.actor;
    const githubOrg = github.context.payload.organization.login;
    const { data: members } = await octokit.rest.teams.listMembersInOrg({ githubOrg, adminTeamSlug });

    const { owner, repo } = github.context.repo;
    const issueNumber = github.context.issue.number;
    const { data: comment } = await octokit.issues.getComment({ owner, repo, comment_id: github.context.payload.comment.id });
    const commentStr = comment.body;

    if (members.includes(commentAuthor) && commentStr.toLowerCase().includes(approveMessage)) {
        console.log(`User access is approved by ${commentAuthor}`);

        const { data: issue } = await octokit.issues.get({ owner, repo, issue_number: issueNumber });
        console.log('Issue body:', issue.body);

        const parsedYaml = yaml.safeLoad(issue.body);
        console.log('Parsed YAML:', parsedYaml);

        const users = parsedYaml.user;
        console.log('Users:', users);
        users.forEach(user => {
            octokit.rest.orgs.setMembershipForUser({
                org: githubOrg,
                role: 'member',
                username: user
            });

            octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
                org: githubOrg,
                team_slug: 'user',
                username: user
            });
        });
    } else {
        console.log(`Comment does not include an approve or author is not authorized.`);
    }

} catch (error) {
  core.setFailed(error.message);
}