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
exports.dockerLogin = exports.loadImage = exports.saveImage = exports.pushImage = exports.statsContainers = exports.statsContainer = exports.watchContainersStats = exports.watchContainerStats = exports.createNetwork = exports.runContainer = exports.buildImage = exports.Container = exports.runSpawn = void 0;
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
const watchContainerStats = (idOrName, cb = (result, error) => { }, interval = 3, options = {}, log = false) => {
    (0, exports.statsContainer)(idOrName, options, log)
        .then((result) => cb(result, null))
        .catch((err) => {
        cb(null, err);
        clearInterval(intervalId);
    });
    const intervalId = setInterval(() => {
        (0, exports.statsContainer)(idOrName, options, log)
            .then((result) => cb(result, null))
            .catch((err) => {
            cb(null, err);
            clearInterval(intervalId);
        });
    }, interval * 1000);
    return {
        intervalId,
        kill: () => clearInterval(intervalId),
    };
};
exports.watchContainerStats = watchContainerStats;
const watchContainersStats = (idOrNames, cb = (results, error) => { }, interval = 3, options = {}, log = false) => {
    (0, exports.statsContainers)(idOrNames, options, log)
        .then((results) => cb(results, null))
        .catch((err) => {
        cb(null, err);
        clearInterval(intervalId);
    });
    const intervalId = setInterval(() => {
        (0, exports.statsContainers)(idOrNames, options, log)
            .then((results) => cb(results, null))
            .catch((err) => {
            cb(null, err);
            clearInterval(intervalId);
        });
    }, interval * 1000);
    return {
        intervalId,
        kill: () => clearInterval(intervalId),
    };
};
exports.watchContainersStats = watchContainersStats;
const statsContainer = (idOrName, options = {}, log = false) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield (0, exports.statsContainers)([idOrName], options, log);
    return results[0];
});
exports.statsContainer = statsContainer;
const statsContainers = (idOrNames, options = {}, log = false) => __awaiter(void 0, void 0, void 0, function* () {
    let results = [];
    for (const idOrName of idOrNames) {
        const cmd = `docker stats ${idOrName.trim()} --no-stream --format "{{ json . }}"`;
        if (log) {
            console.log(`> ${cmd}`);
        }
        const { stdout, stderr } = yield exec(cmd, options);
        if (stdout) {
            if (log) {
                console.log(stdout);
            }
            results.push(JSON.parse(stdout));
        }
        if (stderr && log) {
            console.log(stderr);
        }
    }
    return results;
});
exports.statsContainers = statsContainers;
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
