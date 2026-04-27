import { AxiosRequestConfig } from "axios";

export class ApiClientBase {
    protected async transformOptions(options: AxiosRequestConfig): Promise<AxiosRequestConfig> {
        options.transformResponse = (data: unknown): unknown => data;
        return options;
    }
}
