import util from "node:util";
const exec = util.promisify(require("node:child_process").exec);

async function runCmd(cmd: string, options: any = {}) {
  console.log(`> ${cmd}`);
  const { stdout, stderr } = await exec(cmd, options);
  if (stderr) {
    console.log(stderr);
    throw new Error(stderr);
  }
  return stdout;
}

export interface StringMap {
  [key: string]: string;
}

export interface NetworkOptions {
  name: string;
}

export interface ImageOptions {
  image: string;
  tag?: string;
  cwd?: string;
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

  constructor(containerOptions: ContainerOptions) {
    for (const key in containerOptions) {
      this[key] = containerOptions[key];
    }
  }

  async start() {
    return await runCmd(`docker start ${this.name}`);
  }

  async stop() {
    return await runCmd(`docker stop ${this.name}`);
  }

  async kill() {
    return await runCmd(`docker kill ${this.name}`);
  }

  async restart() {
    return await runCmd(`docker restart ${this.name}`);
  }

  async run() {
    return await runCmd(
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
      }:${this.tag}`
    );
  }

  async logs() {
    return await runCmd(`docker logs ${this.name}`);
  }
}

export const buildImage = async (imageOptions: ImageOptions) => {
  return await runCmd(
    `docker build -t ${imageOptions.image}:${imageOptions.tag || "latest"} .`,
    { cwd: imageOptions.cwd || process.cwd() }
  );
};

export const runContainer = async (
  containerOptions: ContainerOptions,
  cb = (stdout: any) => {}
) => {
  const container = new Container(containerOptions);
  const stdout = await container.run();
  cb(stdout);
  return container;
};

export const createNetwork = async (networkOptions: NetworkOptions) => {
  return await runCmd(`docker network create ${networkOptions.name}`);
};
