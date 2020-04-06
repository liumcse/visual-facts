import * as nodegit from "nodegit";

/**
 * Loads a local repository and returns a Repository instance
 * @param absolutePath Absolute path to repo
 */
export async function loadRepo(absolutePath: string) {
  const repo = await nodegit.Repository.open(absolutePath);
  return repo;
}

export async function getRepoURL(absolutePath: string) {
  const repo = await loadRepo(absolutePath);
  const repoConfig = await repo.config();
  const urlBuffer = await repoConfig.getStringBuf("remote.origin.url");
  return urlBuffer.toString();
}

export async function cloneRepo(
  repoURL: string,
  localPath: string,
  branchName: string,
) {
  await nodegit.Clone.clone(repoURL, localPath, {
    checkoutBranch: branchName,
    fetchOpts: {
      callbacks: {
        certificateCheck: () => 0,
      },
    },
  });
}

/**
 * Returns remote branches of a repository
 * @param repo Repository to load branches from
 */
export async function loadBranches(repo: nodegit.Repository) {
  const branches = await repo.getReferenceNames(nodegit.Reference.TYPE.LISTALL);
  // Filter out remote branches
  const remoteBranches = branches
    .filter((branchName: string) => branchName.includes("refs/remotes/origin/"))
    .map((branchName: string) =>
      branchName.replace("refs/remotes/origin/", ""),
    );
  // Remove duplicates
  return Array.from(new Set(remoteBranches));
}

/**
 * Returns commit history of a repository under given branch
 * @param repo Repository to load commits from
 * @param branchName Branch name to load commits from
 */
export async function loadCommitsOfBranch(
  repo: nodegit.Repository,
  branchName: string,
) {
  const commit = await repo.getReferenceCommit(branchName);
  const eventEmitter = commit.history();
  const commits: nodegit.Commit[] = [];
  await (function() {
    return new Promise(resolve => {
      eventEmitter.on("commit", _commit => {
        commits.push(_commit);
      });
      eventEmitter.on("end", _commits => {
        resolve();
      });
      eventEmitter.start();
    });
  })();
  return commits;
}
