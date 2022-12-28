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
    constructor(containerOptions: ContainerOptions);
    start(): Promise<any>;
    stop(): Promise<any>;
    restart(): Promise<any>;
    run(): Promise<any>;
    logs(): Promise<any>;
}
export declare const buildImage: (imageOptions: ImageOptions) => Promise<any>;
export declare const runContainer: (containerOptions: ContainerOptions, cb?: (stdout: any) => void) => Promise<Container>;
export declare const createNetwork: (networkOptions: NetworkOptions) => Promise<any>;
