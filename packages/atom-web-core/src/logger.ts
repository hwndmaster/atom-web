/* eslint-disable no-console */

interface Logger {
    error(message: unknown, ...args: unknown[]): void;
    info(message: unknown, ...args: unknown[]): void;
}

class DefaultLogger implements Logger {
    public error(message: unknown, ...args: unknown[]): void {
        console.error(message, ...args);
    }

    public info(message: unknown, ...args: unknown[]): void {
        console.log(message, ...args);
    }
}

const defaultLogger: DefaultLogger = new DefaultLogger();

/**
 * Returns a logger with the component name included in log messages.
 * @param componentName The name of the component.
 * @returns The logger object.
 */
function withComponentName(componentName: string): Logger {
    return {
        error: (message: unknown, ...args: unknown[]): void => {
            defaultLogger.error(`[%c${componentName}%c] ` + message, ...["color: #6085ae; font-weight: bold;", "", ...args]);
        },
        info: (message: unknown, ...args: unknown[]): void => {
            defaultLogger.info(`[%c${componentName}%c] ` + message, ...["color: #6085ae; font-weight: bold;", "", ...args]);
        }
    };
}

export type { Logger, DefaultLogger };
export { withComponentName };
export default defaultLogger;
