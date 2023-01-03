import { spawn } from "node:child_process";

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

async function runSpawn(
  cmd: string,
  options: any = {},
  cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {},
  log = false
): Promise<string> {
  if (log) {
    console.log(`> ${cmd}`);
  }
  const cmdarr = cmd
    .split(" ")
    .map((arg) => arg.trim())
    .filter((arg) => arg);
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

  let result = "";
  const child = spawn(command, args, options);
  child.stdout.on("data", (data) => {
    const stdout = data + "";
    if (log) {
      console.log(stdout);
    }
    result += stdout;
    cb(stdout, null, null, null);
  });
  child.stderr.on("data", (data) => {
    const stderr = data + "";
    if (log) {
      console.error(stderr);
    }
    result += stderr;
    cb(null, stderr, null, null);
  });
  return new Promise((resolve, reject) => {
    child.on("error", (error) => {
      if (log) {
        console.error(error.message);
      }
      cb(null, null, error, null);
      reject(error);
    });
    child.on("close", (code) => {
      cb(null, null, null, code);
      resolve(result);
    });
  });
}

export interface StringMap {
  [key: string]: string;
}

export interface NetworkOptions {
  name: string;

  log?: boolean;
  cmdType?: string;
  cmdOptions?: any;
}

export interface ImageOptions {
  image: string;
  tag?: string;
  cwd?: string;

  log?: boolean;
  cmdType?: string;
  cmdOptions?: any;
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

  log?: boolean;
  cmdType?: string;
  cmdOptions?: any;
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
  log = false;
  cmdOptions = {};
  cmdType = "exec";

  constructor(containerOptions: ContainerOptions) {
    for (const key in containerOptions) {
      this[key] = containerOptions[key];
    }
  }

  async start(
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {}
  ) {
    return await runSpawn(
      `docker start ${this.name}`,
      this.cmdOptions,
      cb,
      this.log
    );
  }

  async stop(
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {}
  ) {
    return await runSpawn(
      `docker stop ${this.name}`,
      this.cmdOptions,
      cb,
      this.log
    );
  }

  async kill(
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {}
  ) {
    return await runSpawn(
      `docker kill ${this.name}`,
      this.cmdOptions,
      cb,
      this.log
    );
  }

  async restart(
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {}
  ) {
    return await runSpawn(
      `docker restart ${this.name}`,
      this.cmdOptions,
      cb,
      this.log
    );
  }

  async run(
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {}
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
      `docker run ${this.autoRemove ? "--rm" : ""} ${this.detach ? "-d" : ""} ${
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
      this.log
    );
  }

  async logs(
    cb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {}
  ) {
    return await runSpawn(
      `docker logs ${this.name}`,
      this.cmdOptions,
      cb,
      this.log
    );
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
    imageOptions.log || false
  );
};

export const runContainer = async (
  containerOptions: ContainerOptions,
  cb = (result: string) => {},
  ccb = (stdout?: string, stderr?: string, error?: Error, code?: number) => {}
) => {
  const container = new Container(containerOptions);
  cb(await container.run(ccb));
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
    networkOptions.log || false
  );
};
