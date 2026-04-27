/**
 * Holds the result of an API call — data, errors, and status code.
 * Used by the callApi() fluent builder in atom-react-redux.
 */
export class ApiCallResult<TResponse = unknown> {
    private readonly dataValue: TResponse | undefined;
    private readonly errorsValue: string[];
    private readonly statusCodeValue: number;

    constructor(data: TResponse | undefined, errors: string[], statusCode: number) {
        this.dataValue = data;
        this.errorsValue = errors;
        this.statusCodeValue = statusCode;
    }

    /**
     * The response data. Throws if the response has errors.
     */
    get data(): TResponse {
        if (this.hasErrors) {
            throw new Error(
                "The API response has errors. Use `hasErrors` to check for errors before accessing the data."
            );
        }
        return this.dataValue!;
    }

    /** The errors raised. */
    get errors(): string[] {
        return this.errorsValue;
    }

    /** The status code of the response. */
    get statusCode(): number {
        return this.statusCodeValue;
    }

    /** Whether the response has errors. */
    get hasErrors(): boolean {
        return this.errors.length > 0;
    }
}
