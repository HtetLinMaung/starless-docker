/// <reference types="node" />
/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from "node:child_process";
export interface RunSpawnResponse {
    result: string;
    child: ChildProcessWithoutNullStreams;
}
export declare function runSpawn(cmd: string, options?: any, cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void, waitUntilClose?: boolean, log?: boolean): Promise<ChildProcessWithoutNullStreams | string>;
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
export declare class Container {
    name: string;
    autoRemove: boolean;
    detach: boolean;
    network: string;
    publish: string;
    environments: StringMap;
    volumes: string[];
    image: string;
    tag: string;
    cpuPeriod: number;
    cpuQuota: number;
    cpus: number;
    memory: string;
    memorySwap: string;
    restartContainer: string;
    log: boolean;
    cmdOptions: {};
    cmdType: string;
    constructor(containerOptions: ContainerOptions);
    start(cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void, waitUntilClose?: boolean): Promise<string | ChildProcessWithoutNullStreams>;
    stop(cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void, waitUntilClose?: boolean): Promise<string | ChildProcessWithoutNullStreams>;
    kill(cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void, waitUntilClose?: boolean): Promise<string | ChildProcessWithoutNullStreams>;
    restart(cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void, waitUntilClose?: boolean): Promise<string | ChildProcessWithoutNullStreams>;
    run(cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void, waitUntilClose?: boolean): Promise<string | ChildProcessWithoutNullStreams>;
    logs(logOptions?: LogOptions, cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void): Promise<string | ChildProcessWithoutNullStreams>;
}
export declare const buildImage: (imageOptions: ImageOptions, cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void) => Promise<string | ChildProcessWithoutNullStreams>;
export declare const runContainer: (containerOptions: ContainerOptions, cb?: (result: string) => void, ccb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void, waitUntilClose?: boolean) => Promise<Container>;
export declare const createNetwork: (networkOptions: NetworkOptions, cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void) => Promise<string | ChildProcessWithoutNullStreams>;
export declare const watchContainerStats: (idOrName: string, cb?: (result: any, error: any) => void, interval?: number, options?: any, log?: boolean) => {
    intervalId: NodeJS.Timer;
    kill: () => void;
};
export declare const watchContainersStats: (idOrNames: string[], cb?: (results: any[], error: any) => void, interval?: number, options?: any, log?: boolean) => {
    intervalId: NodeJS.Timer;
    kill: () => void;
};
export declare const statsContainer: (idOrName: string, options?: any, log?: boolean) => Promise<any>;
export declare const statsContainers: (idOrNames: string[], options?: any, log?: boolean) => Promise<any[]>;
export declare const pushImage: (image: string, cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void, log?: boolean) => Promise<string | ChildProcessWithoutNullStreams>;
export declare const saveImage: (image: string, output: string, cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void, log?: boolean) => Promise<string | ChildProcessWithoutNullStreams>;
export declare const loadImage: (input: string, cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void, log?: boolean) => Promise<string | ChildProcessWithoutNullStreams>;
export declare const dockerLogin: (username: string, password: string, cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void, log?: boolean) => Promise<string | ChildProcessWithoutNullStreams>;
