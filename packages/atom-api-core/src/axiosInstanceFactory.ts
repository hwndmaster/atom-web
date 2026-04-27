import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { withComponentName } from "@hwndmaster/atom-web-core";
import type { Logger } from "@hwndmaster/atom-web-core";
import { ApiTimeoutMs } from "./constants";

class AxiosInstanceFactory {
    readonly logger: Logger;
    private timeout: number = ApiTimeoutMs;

    constructor(private readonly baseUrl: string, apiName?: string) {
        this.logger = withComponentName(apiName ?? baseUrl);
    }

    withTimeout(timeout: number): AxiosInstanceFactory {
        this.timeout = timeout;
        return this;
    }

    build(): AxiosInstance {
        const axiosInstance: AxiosInstance = axios.create({
            baseURL: this.baseUrl,
            timeout: this.timeout,
        });

        axiosInstance.interceptors.request.use(
            async (requestConfig) => {
                if (requestConfig.data != null) {
                    requestConfig.headers["Content-Type"] = "application/json; charset=utf-8";
                }
                return requestConfig;
            },
            async (error: AxiosError) => {
                this.logger.error(error);
                return Promise.reject(error);
            }
        );

        axiosInstance.interceptors.response.use(
            (responseConfig: AxiosResponse) => {
                return responseConfig;
            },
            async (error: AxiosError) => {
                if (error.response == null) {
                    this.logger.error("No response received. Details: %o", error);
                }
                return Promise.reject(error);
            }
        );

        return axiosInstance;
    }
}

export default AxiosInstanceFactory;
