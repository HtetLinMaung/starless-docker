"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNetwork = exports.runContainer = exports.buildImage = exports.Container = void 0;
const node_util_1 = __importDefault(require("node:util"));
const exec = node_util_1.default.promisify(require("node:child_process").exec);
function runCmd(cmd, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`> ${cmd}`);
        const { stdout, stderr } = yield exec(cmd, options);
        if (stderr) {
            console.log(stderr);
            throw new Error(stderr);
        }
        return stdout;
    });
}
class Container {
    constructor(containerOptions) {
        this.autoRemove = false;
        this.detach = true;
        this.network = "";
        this.publish = "";
        this.environments = {};
        this.volumes = [];
        this.tag = "latest";
        this.cpuPeriod = 0;
        this.cpuQuota = 0;
        this.cpus = 0;
        this.memory = "";
        this.memorySwap = "";
        for (const key in containerOptions) {
            this[key] = containerOptions[key];
        }
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield runCmd(`docker start ${this.name}`);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield runCmd(`docker stop ${this.name}`);
        });
    }
    kill() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield runCmd(`docker kill ${this.name}`);
        });
    }
    restart() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield runCmd(`docker restart ${this.name}`);
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.network) {
                try {
                    const stdout = yield (0, exports.createNetwork)({ name: this.network });
                    if (stdout) {
                        console.log(stdout);
                    }
                }
                catch (err) {
                    console.log(err.message);
                }
            }
            return yield runCmd(`docker run ${this.autoRemove ? "--rm" : ""} ${this.detach ? "-d" : ""} ${this.network ? `--network=${this.network}` : ""} ${this.name ? `--name ${this.name}` : ""} ${this.publish ? `-p ${this.publish}` : ""} ${this.cpuPeriod ? `--cpu-period=${this.cpuPeriod}` : ""} ${this.cpuQuota ? `--cpu-quota=${this.cpuQuota}` : ""} ${this.cpus ? `--cpus=${this.cpus}` : ""} ${this.memory ? `--memory=${this.memory}` : ""} ${this.memorySwap ? `--memory-swap=${this.memorySwap}` : ""} ${Object.entries(this.environments)
                .map(([k, v]) => `-e ${k}=${v}`)
                .join(" ")} ${this.volumes.map((v) => `-v ${v}`).join(" ")} ${this.image}:${this.tag}`);
        });
    }
    logs() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield runCmd(`docker logs ${this.name}`);
        });
    }
}
exports.Container = Container;
const buildImage = (imageOptions) => __awaiter(void 0, void 0, void 0, function* () {
    return yield runCmd(`docker build -t ${imageOptions.image}:${imageOptions.tag || "latest"} .`, { cwd: imageOptions.cwd || process.cwd() });
});
exports.buildImage = buildImage;
const runContainer = (containerOptions, cb = (stdout) => { }) => __awaiter(void 0, void 0, void 0, function* () {
    const container = new Container(containerOptions);
    const stdout = yield container.run();
    cb(stdout);
    return container;
});
exports.runContainer = runContainer;
const createNetwork = (networkOptions) => __awaiter(void 0, void 0, void 0, function* () {
    return yield runCmd(`docker network create ${networkOptions.name}`);
});
exports.createNetwork = createNetwork;
