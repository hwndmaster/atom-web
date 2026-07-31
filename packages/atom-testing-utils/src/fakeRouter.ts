import { vi } from "vitest";
import { createMemoryHistory } from "history";

const history = createMemoryHistory({ initialEntries: ["/"] });

let params: unknown;

vi.mock("react-router", async () => ({
    ...await vi.importActual("react-router"),
    useParams: (): unknown => params,
}));

/**
 * Sets the parameters returned by useParams().
 * @param newParams The parameters to set.
 */
function setParams(newParams: unknown): void {
    params = newParams;
}

/**
 * Resets the router state to initial values.
 */
function reset(): void {
    params = undefined;
    if (history.location.pathname !== "/") {
        history.replace("/");
    }
}

export { history, setParams, reset };
