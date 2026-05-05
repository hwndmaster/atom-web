// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SagaGenerator = Generator<any, any, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SagaGeneratorReturns<T> = Generator<any, T, any>;

export type SagaFunction<T> = () => Generator<unknown, T, unknown>;
