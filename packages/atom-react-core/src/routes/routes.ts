import { NavigateFunction, Location as ReactLocation } from "react-router-dom";

export interface RouteDefinition {
    path: string;
    defaultParams: Record<string, unknown>;
    state?: Record<string, unknown>;
}

/**
 * Creates a route string from a route definition and parameters.
 * @param route The route definition.
 * @param params The route parameters.
 * @returns The resolved route path string.
 */
export function getRouteWithParameters<TRoute extends RouteDefinition>(
    route: TRoute,
    params?: TRoute["defaultParams"]
): string {
    const mergedParams = { ...route.defaultParams, ...params };
    return route.path.replace(/:(\w+)/g, (_match: string, paramName: string) => mergedParams[paramName]!.toString());
}

/**
 * Navigates to a route with the given parameters.
 * @param navigate The navigate function from useNavigate().
 * @param route The route to navigate to.
 * @param params The parameters to use in the route.
 * @param state Optional navigation state.
 */
export async function goTo<TRoute extends RouteDefinition>(
    navigate: NavigateFunction,
    route: TRoute,
    params?: TRoute["defaultParams"],
    state?: TRoute["state"]
): Promise<void> {
    await navigate(getRouteWithParameters(route, params), { state });
}

/**
 * Returns the route definition from the routes map that matches the current location.
 * @param routes The project's routes dictionary (e.g. AppRoutes).
 * @param location The location object from useLocation().
 * @returns The matching route definition, or null if not found.
 */
export function getCurrentRoute(
    routes: Record<string, RouteDefinition>,
    location: Location | ReactLocation
): RouteDefinition | null {
    const routeKey = Object.keys(routes).find((key) => {
        const route = routes[key]!;
        const normalizedPath = location.pathname.length > 2
            ? location.pathname.replace(/\/$/, "")
            : location.pathname;
        const re = new RegExp(route.path.replace(/:(\w)+/g, "([^/]+)") + "$", "g");
        return re.test(normalizedPath);
    });

    if (routeKey == null) {
        return null;
    }

    return routes[routeKey]!;
}
