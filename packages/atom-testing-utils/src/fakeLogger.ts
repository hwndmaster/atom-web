import { vi } from "vitest";
import { defaultLogger, withComponentName } from "@hwndmaster/atom-web-core";
import type { Logger } from "@hwndmaster/atom-web-core";

interface FakeLoggerEntry {
    component?: string;
    message: unknown;
    args: unknown[];
}

/**
 * Base class for a fake logger. Extend this in your project and wire up vi.spyOn to capture log calls.
 *
 * @example
 * // In your project's test utils:
 * import { FakeLogger } from "@hwndmaster/atom-testing-utils";
 * import defaultLogger, { withComponentName } from "@hwndmaster/atom-web-core";
 *
 * const fakeLogger = new FakeLogger();
 * vi.spyOn(defaultLogger, "error").mockImplementation(fakeLogger.error.bind(fakeLogger));
 * vi.spyOn(defaultLogger, "info").mockImplementation(fakeLogger.info.bind(fakeLogger));
 * vi.spyOn(withComponentName, ...) // project-specific
 */
export class FakeLogger implements Logger {
    protected errorEntries: FakeLoggerEntry[] = [];
    protected infoEntries: FakeLoggerEntry[] = [];

    public error(message: unknown, ...args: unknown[]): void {
        this.errorEntries.push({ message, args: args.flat() });
    }

    public info(message: unknown, ...args: unknown[]): void {
        this.infoEntries.push({ message, args });
    }

    public addError(entry: FakeLoggerEntry): void {
        this.errorEntries.push(entry);
    }

    public addInfo(entry: FakeLoggerEntry): void {
        this.infoEntries.push(entry);
    }

    public reset(): void {
        this.errorEntries = [];
        this.infoEntries = [];
    }

    public get errors(): Readonly<FakeLoggerEntry[]> {
        return this.errorEntries;
    }

    public get infos(): Readonly<FakeLoggerEntry[]> {
        return this.infoEntries;
    }
}

export class FakeLoggerWithComponentName implements Logger {
    constructor(private readonly componentName: string, private readonly logger: FakeLogger) {
    }

    public error(message: unknown, ...args: unknown[]): void {
        this.logger.addError({ component: this.componentName, message, args: args.flat() });
    }

    public info(message: unknown, ...args: unknown[]): void {
        this.logger.addInfo({ component: this.componentName, message, args });
    }
}

export type { FakeLoggerEntry };

/**
 * Sets up a FakeLogger instance to intercept all default logger and withComponentName calls.
 * Call this once before your test suite (e.g. in beforeEach), or at module level.
 * @param defaultLoggerModule The module default export (defaultLogger from atom-web-core).
 * @param withComponentNameFn The withComponentName function from atom-web-core.
 * @returns The FakeLogger instance to use in assertions.
 */
export function setupFakeLogger(
    defaultLoggerModule: { error: Logger["error"]; info: Logger["info"] },
    _withComponentNameFn: unknown
): FakeLogger {
    const fakeLogger = new FakeLogger();

    vi.spyOn(defaultLoggerModule, "error").mockImplementation((message: unknown, ...args: unknown[]) => {
        fakeLogger.error(message, ...args);
    });

    vi.spyOn(defaultLoggerModule, "info").mockImplementation((message: unknown, ...args: unknown[]) => {
        fakeLogger.info(message, ...args);
    });

    return fakeLogger;
}

/**
 * Pre-configured singleton FakeLogger instance.
 * Import this directly in test files — no setup required.
 *
 * @example
 * import { fakeLogger } from "@hwndmaster/atom-testing-utils";
 *
 * afterEach(() => { fakeLogger.reset(); });
 */
export const fakeLogger = setupFakeLogger(defaultLogger, withComponentName);
