export interface DataTestIdProp {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "data-test_id"?: string;
}

export type WithDataTestId<T> = T & DataTestIdProp;