import { ChildProcessWithoutNullStreams } from "child_process";
import {
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

  const watcher = watchContainersStats(["nginx"], (results, err) => {
    console.log(results);
  });
  setTimeout(() => {
    watcher.kill();
  }, 4000);
  console.log("do other stuff");
}
main();
