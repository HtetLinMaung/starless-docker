import { statsContainers } from ".";

async function main() {
  await statsContainers(
    ["nginx", "nginx2"],
    {
      waitUntilClose: false,
    },
    (stats) => {
      console.log(stats);
    }
  );
  // const results = await statsContainers(["nginx", "nginx2"]);
  // console.log(results);
}
main();
