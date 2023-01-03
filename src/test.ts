import { ChildProcessWithoutNullStreams } from "child_process";
import { runSpawn } from ".";

async function main() {
  (await runSpawn(
    "docker logs --follow nginx",
    {},
    (stdout, stderr, error, code) => {},
    true,
    true
  )) as ChildProcessWithoutNullStreams;
  console.log("process finished");
}
main();
