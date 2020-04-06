import axios from "axios";

const BASE_URL = "http://localhost:8080";

export async function getFacts(repoUrl: string, commitHash: string) {
  console.log("get facts called");
  const res = await axios.get(
    `${BASE_URL}/facts/?repo_url=${repoUrl}&commit_hash=${commitHash}`,
  );
  console.log(res.data["facts"]);
  return res.data["facts"];
}
