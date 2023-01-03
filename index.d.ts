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
    log: boolean;
    cmdOptions: {};
    cmdType: string;
    constructor(containerOptions: ContainerOptions);
    start(cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void): Promise<string>;
    stop(cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void): Promise<string>;
    kill(cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void): Promise<string>;
    restart(cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void): Promise<string>;
    run(cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void): Promise<string>;
    logs(cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void): Promise<string>;
}
export declare const buildImage: (imageOptions: ImageOptions, cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void) => Promise<string>;
export declare const runContainer: (containerOptions: ContainerOptions, cb?: (result: string) => void, ccb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void) => Promise<Container>;
export declare const createNetwork: (networkOptions: NetworkOptions, cb?: (stdout?: string, stderr?: string, error?: Error, code?: number) => void) => Promise<string>;
