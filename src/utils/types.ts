// eslint-disable-next-line
export type AwaitedReturn<T extends (...args: any) => any> = Awaited<ReturnType<T>>;
