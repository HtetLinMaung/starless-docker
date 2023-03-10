import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { stdin } from "node:process";
import { promisify } from "node:util";
const exec = promisify(require("node:child_process").exec);

// async function runCmd(
//   cmd: string,
//   options: any = {},
//   log = false,
//   type = "exec"
// ) {
//   if (log) {
//     console.log(`> ${cmd}`);
//   }
//   if (type == "exec") {
//     const { stdout, stderr } = await exec(cmd, options);
//     if (log) {
//       if (stdout) {
//         console.log(stdout);
//       }
//       if (stderr) {
//         console.log(stderr);
//       }
//     }
//     return { stdout, stderr };
//   } else if (type == "spawn" || type == "spawnSync") {
//     const cmdarr = cmd
//       .split(" ")
//       .map((arg) => arg.trim())
//       .filter((arg) => arg);
//     let command = "";
//     let args = [];
//     if (cmdarr.length) {
//       command = cmdarr[0];
//       if (cmdarr.length > 1) {
//         args = cmdarr.slice(1, cmdarr.length);
//       }
//     }
//     if (!command) {
//       throw new Error("Invalid command!");
//     }

//     return type == "spawn"
//       ? spawn(command, args, options)
//       : spawnSync(command, args, options);
//   }
// }

export interface RunSpawnResponse {
  result: string;
  child: ChildProcessWithoutNullStreams;
}

export async function runSpawn(
  cmd: string | string[],
  options: any = {},
  cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
  waitUntilClose = true,
  log = false
): Promise<ChildProcessWithoutNullStreams | string> {
  const cmdarr =
    typeof cmd == "string"
      ? cmd
          .split(" ")
          .map((arg) => arg.trim())
          .filter((arg) => arg)
      : cmd;
  let command = "";
  let args = [];
  if (cmdarr.length) {
    command = cmdarr[0];
    if (cmdarr.length > 1) {
      args = cmdarr.slice(1, cmdarr.length);
    }
  }
  if (!command) {
    throw new Error("Invalid command!");
  }

  let inputs: string[] = [];
  if (options.inputs) {
    inputs = options.inputs;
    delete options.inputs;
  }
  let result = "";
  const child = spawn(command, args, options);
  if (log) {
    console.log(
      `[${child.pid}] > ${typeof cmd == "string" ? cmd : cmd.join(" ")}`
    );
  }
  child.stdout.on("data", (data) => {
    const stdout = data + "";
    if (log) {
      console.log(`[${child.pid}] ${stdout}`);
    }
    result += stdout;
    cb(stdout, null, null, null);
  });
  child.stderr.on("data", (data) => {
    const stderr = data + "";
    if (log) {
      console.error(`[${child.pid}] ${stderr}`);
    }
    result += stderr;
    cb(null, stderr, null, null);
  });
  if (inputs.length) {
    for (const input of inputs) {
      child.stdin.write(`${input}\n`);
    }
    child.stdin.end();
  }

  if (waitUntilClose) {
    return new Promise((resolve, reject) => {
      child.on("error", (error) => {
        if (log) {
          console.error(`[${child.pid}] ${error.message}`);
        }
        cb(null, null, error, null);
        reject(error);
      });
      child.on("close", (code) => {
        cb(null, null, null, code);
        resolve(result);
      });
    });
  } else {
    child.on("error", (error) => {
      if (log) {
        console.error(`[${child.pid}] ${error.message}`);
      }
      cb(null, null, error, null);
    });
    child.on("close", (code) => {
      cb(null, null, null, code);
    });
    return child;
  }
}

export interface StringMap {
  [key: string]: string;
}

export interface NetworkOptions {
  name: string;

  log?: boolean;
  cmdType?: string;
  cmdOptions?: any;
  waitUntilClose?: boolean;
}

export interface ImageOptions {
  image: string;
  tag?: string;
  cwd?: string;

  log?: boolean;
  cmdType?: string;
  cmdOptions?: any;
  waitUntilClose?: boolean;
}

export interface ContainerOptions {
  name: string;
  autoRemove?: boolean;
  detach?: boolean;
  network?: string;
  publish?: string;
  environments?: StringMap;
  volumes?: string[];
  image: string;
  tag?: string;
  cpuPeriod?: number;
  cpuQuota?: number;
  cpus?: number;
  memory?: string;
  memorySwap?: string;
  restartContainer?: string;

  log?: boolean;
  cmdType?: string;
  cmdOptions?: any;
}

export interface LogOptions {
  follow?: boolean;
  until?: string;
  since?: string;
  details?: boolean;
  tail?: number;
  timestamps?: boolean;
}

export class Container {
  name: string;
  autoRemove = false;
  detach = true;
  network = "";
  publish = "";
  environments: StringMap = {};
  volumes: string[] = [];
  image: string;
  tag = "latest";
  cpuPeriod = 0;
  cpuQuota = 0;
  cpus = 0;
  memory = "";
  memorySwap = "";
  restartContainer = "";

  log = false;
  cmdOptions = {};
  cmdType = "exec";

  constructor(containerOptions: ContainerOptions) {
    for (const key in containerOptions) {
      this[key] = containerOptions[key];
    }
  }

  async start(
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
    waitUntilClose = true
  ) {
    return await runSpawn(
      `docker start ${this.name}`,
      this.cmdOptions,
      cb,
      waitUntilClose,
      this.log
    );
  }

  async stop(
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
    waitUntilClose = true
  ) {
    return await runSpawn(
      `docker stop ${this.name}`,
      this.cmdOptions,
      cb,
      waitUntilClose,
      this.log
    );
  }

  async kill(
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
    waitUntilClose = true
  ) {
    return await runSpawn(
      `docker kill ${this.name}`,
      this.cmdOptions,
      cb,
      waitUntilClose,
      this.log
    );
  }

  async restart(
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
    waitUntilClose = true
  ) {
    return await runSpawn(
      `docker restart ${this.name}`,
      this.cmdOptions,
      cb,
      waitUntilClose,
      this.log
    );
  }

  async run(
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
    waitUntilClose = true
  ) {
    if (this.network) {
      try {
        await createNetwork({ name: this.network });
      } catch (err) {
        if (this.log) {
          console.error(err.message);
        }
      }
    }
    return await runSpawn(
      `docker run ${
        this.restartContainer ? `--restart=${this.restartContainer}` : ""
      } ${this.autoRemove ? "--rm" : ""} ${this.detach ? "-d" : ""} ${
        this.network ? `--network=${this.network}` : ""
      } ${this.name ? `--name ${this.name}` : ""} ${
        this.publish ? `-p ${this.publish}` : ""
      } ${this.cpuPeriod ? `--cpu-period=${this.cpuPeriod}` : ""} ${
        this.cpuQuota ? `--cpu-quota=${this.cpuQuota}` : ""
      } ${this.cpus ? `--cpus=${this.cpus}` : ""} ${
        this.memory ? `--memory=${this.memory}` : ""
      } ${
        this.memorySwap ? `--memory-swap=${this.memorySwap}` : ""
      } ${Object.entries(this.environments)
        .map(([k, v]) => `-e ${k}=${v}`)
        .join(" ")} ${this.volumes.map((v) => `-v ${v}`).join(" ")} ${
        this.image
      }:${this.tag}`,
      this.cmdOptions,
      cb,
      waitUntilClose,
      this.log
    );
  }

  async logs(
    logOptions: LogOptions = {},
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {}
  ) {
    const follow = logOptions.follow || false;
    const until = logOptions.until || "";
    const since = logOptions.since || "";
    const details = logOptions.details || false;
    const tail = logOptions.tail || 0;
    const timestamps = logOptions.timestamps || false;
    return await runSpawn(
      `docker logs ${timestamps ? "-t" : ""} ${tail ? `-n ${tail}` : ""} ${
        details ? "--details" : ""
      } ${follow ? "-f" : ""} ${until ? `--until=${until}` : ""} ${
        since ? `--since ${since}` : ""
      } ${this.name}`,
      this.cmdOptions,
      cb,
      !follow,
      this.log
    );
  }

  async exec(
    cmd: string | string[],
    options: any = {},
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
    waitUntilClose = true
  ) {
    const command =
      typeof cmd == "string"
        ? `docker exec ${this.name} ${cmd}`
        : ["docker", "exec", this.name, ...cmd];
    return await runSpawn(command, options, cb, waitUntilClose, this.log);
  }

  async state() {
    const results = (await runSpawn([
      "docker",
      "ps",
      "-a",
      "--filter",
      `name=${this.name}`,
      "--format",
      `"Names={{.Names}};State={{.State}}"`,
    ])) as string;
    const data = results
      .trim()
      .split("\n")
      .map((dataStr) => {
        let item: any = {};
        const kvlist = dataStr.slice(1, dataStr.length - 1).split(";");
        for (const kv of kvlist) {
          const [k, v] = kv.split("=");
          item[k] = v;
        }
        return item;
      })
      .filter((result) => result.Names == this.name);
    if (data.length) {
      return data[0].State;
    }
    return "unknown";
  }
  async stats(
    options: any = {},
    cb = (stats: ContainerStats[], error: Error) => {}
  ) {
    options.log = this.log;
    return statsContainers([this.name], options, cb);
  }
}

export const buildImage = async (
  imageOptions: ImageOptions,
  cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {}
) => {
  return await runSpawn(
    `docker build -t ${imageOptions.image}:${imageOptions.tag || "latest"} .`,
    {
      ...(imageOptions.cmdOptions || {}),
      cwd: imageOptions.cwd || process.cwd(),
    },
    cb,
    imageOptions.waitUntilClose || true,
    imageOptions.log || false
  );
};

export const runContainer = async (
  containerOptions: ContainerOptions,
  cb = (result: string) => {},
  ccb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
  waitUntilClose = true
) => {
  const container = new Container(containerOptions);
  const result = await container.run(ccb, waitUntilClose);
  cb(result as string);
  return container;
};

export const createNetwork = async (
  networkOptions: NetworkOptions,
  cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {}
) => {
  return await runSpawn(
    `docker network create ${networkOptions.name}`,
    { ...(networkOptions.cmdOptions || {}) },
    cb,
    networkOptions.waitUntilClose || true,
    networkOptions.log || false
  );
};

export const pushImage = async (
  image: string,
  cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
  log = false
) => {
  return await runSpawn(`docker push ${image}`, {}, cb, true, log);
};

export const saveImage = async (
  image: string,
  output: string,
  options: any = {},
  cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
  log = false
) => {
  return await runSpawn(
    `docker save -o ${output} ${image}`,
    options,
    cb,
    true,
    log
  );
};

export const loadImage = async (
  input: string,
  cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
  log = false
) => {
  return await runSpawn(`docker load -i ${input}`, {}, cb, true, log);
};

export const dockerLogin = async (
  username: string,
  password: string,
  cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
  log = false
) => {
  return await runSpawn(
    `docker login -u ${username} -p ${password}`,
    {},
    cb,
    true,
    log
  );
};

export const listContainers = async () => {
  const results = (await runSpawn([
    "docker",
    "ps",
    "-a",
    "--filter",
    "ID=87b6b173298f",
    "--format",
    `"ID={{.ID}};Image={{.Image}};Names={{.Names}};Ports={{.Ports}};State={{.State}};Status={{.Status}};Mounts={{.Mounts}};CreatedAt={{.CreatedAt}}"`,
  ])) as string;
  return results
    .trim()
    .split("\n")
    .map((dataStr) => {
      let item: any = {};
      const kvlist = dataStr.slice(1, dataStr.length - 1).split(";");
      for (const kv of kvlist) {
        const [k, v] = kv.split("=");
        item[k] = v;
      }
      return item;
    });
};

export interface ContainerStats {
  ID: string;
  Container: string;
  Name: string;
  CPUPerc: string;
  MemUsage: string;
  NetIO: string;
  BlockIO: string;
  MemPerc: string;
  PIDs: string;
}

export const statsContainers = async (
  idOrNames: string[],
  options: any = {},
  cb = (stats: ContainerStats[], error: Error) => {}
) => {
  const log = options.log || false;
  let waitUntilClose = true;
  if (typeof options.waitUntilClose == "boolean") {
    waitUntilClose = options.waitUntilClose;
  }
  delete options.log;
  delete options.waitUntilClose;
  const results = await runSpawn(
    waitUntilClose
      ? [
          "docker",
          "stats",
          ...idOrNames,
          "--no-stream",
          "--format",
          `"ID={{.ID}};Container={{.Container}};Name={{.Name}};CPUPerc={{.CPUPerc}};MemUsage={{.MemUsage}};NetIO={{.NetIO}};BlockIO={{.BlockIO}};MemPerc={{.MemPerc}};PIDs={{.PIDs}}"`,
        ]
      : [
          "docker",
          "stats",
          ...idOrNames,
          "--format",
          `"ID={{.ID}};Container={{.Container}};Name={{.Name}};CPUPerc={{.CPUPerc}};MemUsage={{.MemUsage}};NetIO={{.NetIO}};BlockIO={{.BlockIO}};MemPerc={{.MemPerc}};PIDs={{.PIDs}}"`,
        ],
    options,
    (stdout?: string, stderr?: string, error?: Error, code?: number) => {
      if (stdout && stdout != "[2J[H") {
        const stats = stdout
          .trim()
          .split("\n")
          .map((dataStr) => {
            let item: any = {};
            const kvlist = dataStr.slice(1, dataStr.length - 1).split(";");
            for (const kv of kvlist) {
              const [k, v] = kv.split("=");
              item[k] = v;
            }
            return item;
          }) as ContainerStats[];
        cb(stats, error);
      }
    },
    waitUntilClose,
    log
  );
  if (typeof results == "string") {
    return results
      .trim()
      .split("\n")
      .map((dataStr) => {
        let item: any = {};
        const kvlist = dataStr.slice(1, dataStr.length - 1).split(";");
        for (const kv of kvlist) {
          const [k, v] = kv.split("=");
          item[k] = v;
        }
        return item;
      }) as any[];
  }
  return results as ChildProcessWithoutNullStreams;
};
