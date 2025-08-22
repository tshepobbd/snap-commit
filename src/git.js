import { execSync } from "child_process";

export function getStagedDiff() {
  try {
    //console.log(execSync("git diff --cached", { encoding: "utf8" }));
    return execSync("git diff --cached", { encoding: "utf8" });
  } catch (err) {
    console.error("❌ Error getting staged diff:", err.message);
    process.exit(1);
  }
}
