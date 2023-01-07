import { ChildProcessWithoutNullStreams } from "child_process";
import {
  dockerLogin,
  runSpawn,
  statsContainer,
  statsContainers,
  watchContainersStats,
} from ".";

async function main() {
  // (await runSpawn(
  //   "docker stats nginx",
  //   {},
  //   (stdout, stderr, error, code) => {
  //     if (stdout) {
  //       console.log(`stdout: ${stdout}`);
  //       console.log(stdout.trim().split(""));
  //     }
  //     if (stderr) {
  //       console.log(`stderr: ${stderr}`);
  //     }
  //   },
  //   false
  // )) as ChildProcessWithoutNullStreams;
  // console.log("process finished");
  // const stats = await statsContainer("nginx", {}, true);
  // console.log(stats);

  // await dockerLogin("htetlinmaung", "docker2551996", () => {}, true);

  // console.log(results);

  const child = (await runSpawn(
    "docker exec -i nginx bash",
    {
      // inputs: ["ls"],
    },
    () => {},
    false,
    true
  )) as ChildProcessWithoutNullStreams;
  console.log("do other stuff");
  child.stdin.write("ls\n");
  // child.stdin.cork();
  setTimeout(() => {
    console.log("timeout");
    child.stdin.write("ls etc\n");
    child.stdin.end();
  }, 3000);
}
main();
