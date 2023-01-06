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
  console.log("do other stuff");
}
main();
