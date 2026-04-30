import type { Location as ReactLocation, NavigateFunction } from "react-router-dom";
import { getCurrentRoute, getRouteWithParameters, goTo, type RouteDefinition } from "@/routes/routes";

const testRoutes: Record<string, RouteDefinition> = {
    Home: {
        path: "/",
        defaultParams: {},
    },
    UserDetails: {
        path: "/users/:userId/:tab",
        defaultParams: {
            userId: 100,
            tab: "overview",
        },
    },
};

function createLocation(pathname: string): ReactLocation {
    return {
        pathname,
        search: "",
        hash: "",
        state: null,
        key: "test-location",
    } as ReactLocation;
}

describe("getRouteWithParameters", () => {
    test("Given partial params Then merges with defaults", () => {
        // Act
        const result = getRouteWithParameters(testRoutes.UserDetails, { tab: "activity" });

        // Verify
        expect(result).toBe("/users/100/activity");
    });

    test("Given no params Then uses route defaults", () => {
        // Act
        const result = getRouteWithParameters(testRoutes.UserDetails);

        // Verify
        expect(result).toBe("/users/100/overview");
    });
});

describe("goTo", () => {
    test("Given route and state Then navigates with resolved path and state", async () => {
        // Arrange
        const navigateCalls: Array<{ to: unknown; options?: { state?: unknown } }> = [];
        const navigate = ((to: unknown, options?: { state?: unknown }): void => {
            navigateCalls.push({ to, options });
        }) as NavigateFunction;

        // Act
        await goTo(navigate, testRoutes.UserDetails, { userId: 7, tab: "settings" }, { from: "dashboard" });

        // Verify
        expect(navigateCalls).toHaveLength(1);
        expect(navigateCalls[0]).toEqual({
            to: "/users/7/settings",
            options: { state: { from: "dashboard" } },
        });
    });
});

describe("getCurrentRoute", () => {
    test("Given a trailing slash path Then matches route after normalization", () => {
        // Arrange
        const location = createLocation("/users/42/overview/");

        // Act
        const result = getCurrentRoute(testRoutes, location);

        // Verify
        expect(result).toEqual(testRoutes.UserDetails);
    });

    test("Given root path Then matches root route", () => {
        // Arrange
        const location = createLocation("/");

        // Act
        const result = getCurrentRoute(testRoutes, location);

        // Verify
        expect(result).toEqual(testRoutes.Home);
    });

    test("Given unmatched path Then returns null", () => {
        // Arrange
        const location = createLocation("/unknown/path");

        // Act
        const result = getCurrentRoute(testRoutes, location);

        // Verify
        expect(result).toBeNull();
    });
});
