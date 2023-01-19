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
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsContainers = exports.listContainers = exports.dockerLogin = exports.loadImage = exports.saveImage = exports.pushImage = exports.createNetwork = exports.runContainer = exports.buildImage = exports.Container = exports.runSpawn = void 0;
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const exec = (0, node_util_1.promisify)(require("node:child_process").exec);
function runSpawn(cmd, options = {}, cb = (stdout, stderr, error, code) => { }, waitUntilClose = true, log = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmdarr = typeof cmd == "string"
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
        let inputs = [];
        if (options.inputs) {
            inputs = options.inputs;
            delete options.inputs;
        }
        let result = "";
        const child = (0, node_child_process_1.spawn)(command, args, options);
        if (log) {
            console.log(`[${child.pid}] > ${typeof cmd == "string" ? cmd : cmd.join(" ")}`);
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
        }
        else {
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
    });
}
exports.runSpawn = runSpawn;
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
        this.restartContainer = "";
        this.log = false;
        this.cmdOptions = {};
        this.cmdType = "exec";
        for (const key in containerOptions) {
            this[key] = containerOptions[key];
        }
    }
    start(cb = (stdout, stderr, error, code) => { }, waitUntilClose = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield runSpawn(`docker start ${this.name}`, this.cmdOptions, cb, waitUntilClose, this.log);
        });
    }
    stop(cb = (stdout, stderr, error, code) => { }, waitUntilClose = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield runSpawn(`docker stop ${this.name}`, this.cmdOptions, cb, waitUntilClose, this.log);
        });
    }
    kill(cb = (stdout, stderr, error, code) => { }, waitUntilClose = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield runSpawn(`docker kill ${this.name}`, this.cmdOptions, cb, waitUntilClose, this.log);
        });
    }
    restart(cb = (stdout, stderr, error, code) => { }, waitUntilClose = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield runSpawn(`docker restart ${this.name}`, this.cmdOptions, cb, waitUntilClose, this.log);
        });
    }
    run(cb = (stdout, stderr, error, code) => { }, waitUntilClose = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.network) {
                try {
                    yield (0, exports.createNetwork)({ name: this.network });
                }
                catch (err) {
                    if (this.log) {
                        console.error(err.message);
                    }
                }
            }
            return yield runSpawn(`docker run ${this.restartContainer ? `--restart=${this.restartContainer}` : ""} ${this.autoRemove ? "--rm" : ""} ${this.detach ? "-d" : ""} ${this.network ? `--network=${this.network}` : ""} ${this.name ? `--name ${this.name}` : ""} ${this.publish ? `-p ${this.publish}` : ""} ${this.cpuPeriod ? `--cpu-period=${this.cpuPeriod}` : ""} ${this.cpuQuota ? `--cpu-quota=${this.cpuQuota}` : ""} ${this.cpus ? `--cpus=${this.cpus}` : ""} ${this.memory ? `--memory=${this.memory}` : ""} ${this.memorySwap ? `--memory-swap=${this.memorySwap}` : ""} ${Object.entries(this.environments)
                .map(([k, v]) => `-e ${k}=${v}`)
                .join(" ")} ${this.volumes.map((v) => `-v ${v}`).join(" ")} ${this.image}:${this.tag}`, this.cmdOptions, cb, waitUntilClose, this.log);
        });
    }
    logs(logOptions = {}, cb = (stdout, stderr, error, code) => { }) {
        return __awaiter(this, void 0, void 0, function* () {
            const follow = logOptions.follow || false;
            const until = logOptions.until || "";
            const since = logOptions.since || "";
            const details = logOptions.details || false;
            const tail = logOptions.tail || 0;
            const timestamps = logOptions.timestamps || false;
            return yield runSpawn(`docker logs ${timestamps ? "-t" : ""} ${tail ? `-n ${tail}` : ""} ${details ? "--details" : ""} ${follow ? "-f" : ""} ${until ? `--until=${until}` : ""} ${since ? `--since ${since}` : ""} ${this.name}`, this.cmdOptions, cb, !follow, this.log);
        });
    }
    exec(cmd, options = {}, cb = (stdout, stderr, error, code) => { }, waitUntilClose = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = typeof cmd == "string"
                ? `docker exec ${this.name} ${cmd}`
                : ["docker", "exec", this.name, ...cmd];
            return yield runSpawn(command, options, cb, waitUntilClose, this.log);
        });
    }
    state() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = (yield runSpawn([
                "docker",
                "ps",
                "-a",
                "--filter",
                `name=${this.name}`,
                "--format",
                `"Names={{.Names}};State={{.State}}"`,
            ]));
            const data = results
                .trim()
                .split("\n")
                .map((dataStr) => {
                let item = {};
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
        });
    }
}
exports.Container = Container;
const buildImage = (imageOptions, cb = (stdout, stderr, error, code) => { }) => __awaiter(void 0, void 0, void 0, function* () {
    return yield runSpawn(`docker build -t ${imageOptions.image}:${imageOptions.tag || "latest"} .`, Object.assign(Object.assign({}, (imageOptions.cmdOptions || {})), { cwd: imageOptions.cwd || process.cwd() }), cb, imageOptions.waitUntilClose || true, imageOptions.log || false);
});
exports.buildImage = buildImage;
const runContainer = (containerOptions, cb = (result) => { }, ccb = (stdout, stderr, error, code) => { }, waitUntilClose = true) => __awaiter(void 0, void 0, void 0, function* () {
    const container = new Container(containerOptions);
    const result = yield container.run(ccb, waitUntilClose);
    cb(result);
    return container;
});
exports.runContainer = runContainer;
const createNetwork = (networkOptions, cb = (stdout, stderr, error, code) => { }) => __awaiter(void 0, void 0, void 0, function* () {
    return yield runSpawn(`docker network create ${networkOptions.name}`, Object.assign({}, (networkOptions.cmdOptions || {})), cb, networkOptions.waitUntilClose || true, networkOptions.log || false);
});
exports.createNetwork = createNetwork;
const pushImage = (image, cb = (stdout, stderr, error, code) => { }, log = false) => __awaiter(void 0, void 0, void 0, function* () {
    return yield runSpawn(`docker push ${image}`, {}, cb, true, log);
});
exports.pushImage = pushImage;
const saveImage = (image, output, options = {}, cb = (stdout, stderr, error, code) => { }, log = false) => __awaiter(void 0, void 0, void 0, function* () {
    return yield runSpawn(`docker save -o ${output} ${image}`, options, cb, true, log);
});
exports.saveImage = saveImage;
const loadImage = (input, cb = (stdout, stderr, error, code) => { }, log = false) => __awaiter(void 0, void 0, void 0, function* () {
    return yield runSpawn(`docker load -i ${input}`, {}, cb, true, log);
});
exports.loadImage = loadImage;
const dockerLogin = (username, password, cb = (stdout, stderr, error, code) => { }, log = false) => __awaiter(void 0, void 0, void 0, function* () {
    return yield runSpawn(`docker login -u ${username} -p ${password}`, {}, cb, true, log);
});
exports.dockerLogin = dockerLogin;
const listContainers = () => __awaiter(void 0, void 0, void 0, function* () {
    const results = (yield runSpawn([
        "docker",
        "ps",
        "-a",
        "--filter",
        "ID=87b6b173298f",
        "--format",
        `"ID={{.ID}};Image={{.Image}};Names={{.Names}};Ports={{.Ports}};State={{.State}};Status={{.Status}};Mounts={{.Mounts}};CreatedAt={{.CreatedAt}}"`,
    ]));
    return results
        .trim()
        .split("\n")
        .map((dataStr) => {
        let item = {};
        const kvlist = dataStr.slice(1, dataStr.length - 1).split(";");
        for (const kv of kvlist) {
            const [k, v] = kv.split("=");
            item[k] = v;
        }
        return item;
    });
});
exports.listContainers = listContainers;
const statsContainers = (idOrNames, options = {}, cb = (stats, error) => { }) => __awaiter(void 0, void 0, void 0, function* () {
    const log = options.log || false;
    let waitUntilClose = true;
    if (typeof options.waitUntilClose == "boolean") {
        waitUntilClose = options.waitUntilClose;
    }
    delete options.log;
    delete options.waitUntilClose;
    const results = yield runSpawn(waitUntilClose
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
        ], options, (stdout, stderr, error, code) => {
        if (stdout && stdout != "[2J[H") {
            const stats = stdout
                .trim()
                .split("\n")
                .map((dataStr) => {
                let item = {};
                const kvlist = dataStr.slice(1, dataStr.length - 1).split(";");
                for (const kv of kvlist) {
                    const [k, v] = kv.split("=");
                    item[k] = v;
                }
                return item;
            });
            cb(stats, error);
        }
    }, waitUntilClose, log);
    if (typeof results == "string") {
        return results
            .trim()
            .split("\n")
            .map((dataStr) => {
            let item = {};
            const kvlist = dataStr.slice(1, dataStr.length - 1).split(";");
            for (const kv of kvlist) {
                const [k, v] = kv.split("=");
                item[k] = v;
            }
            return item;
        });
    }
    return results;
});
exports.statsContainers = statsContainers;
