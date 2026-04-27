import React, { PropsWithChildren } from "react";
import { Router } from "react-router-dom";
import * as testReact from "@testing-library/react";
import { Provider } from "react-redux";
import { JSX } from "react/jsx-runtime";
import type { Store } from "@reduxjs/toolkit";

export interface ExtendedRenderOptions extends Omit<testReact.RenderOptions, "queries"> {
}

export interface RenderResult extends ReturnType<typeof testReact.render> {
}

/**
 * Renders a React component with a Redux Provider and Router.
 * @param ui The React component to render.
 * @param store The Redux store instance (from fakeStore.store).
 * @param history The memory history (from fakeRouter.history).
 * @param extendedRenderOptions Additional render options.
 * @returns The render result.
 */
export function renderWithProviders(
    ui: React.ReactElement,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store: Store<any>,
    history: { location: { pathname: string; search: string; hash: string; state: unknown; key: string }; [key: string]: unknown },
    extendedRenderOptions: ExtendedRenderOptions = {}
): testReact.RenderResult {
    const { ...renderOptions } = extendedRenderOptions;

    const Wrapper = ({ children }: PropsWithChildren): JSX.Element => (
        <Provider store={store}>
            <Router location={history.location as Parameters<typeof Router>[0]["location"]} navigator={history as unknown as Parameters<typeof Router>[0]["navigator"]}>
                {children}
            </Router>
        </Provider>
    );

    return testReact.render(ui, { wrapper: Wrapper, ...renderOptions });
}
