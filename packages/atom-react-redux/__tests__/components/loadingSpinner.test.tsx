import { act } from "react";
import { screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { fakeRouterHistory, renderWithProviders } from "@hwndmaster/atom-testing-utils";
import { BaseLoadingTargets } from "@hwndmaster/atom-web-core";
import { Common, LoadingSpinner } from "@/index";

type TestStore = ReturnType<typeof createTestStore>;

function createTestStore(): ReturnType<typeof configureStore> {
    return configureStore({ reducer: { common: Common.Reducers } });
}

let store: TestStore;

beforeEach(() => {
    store = createTestStore();
});

test("When target is not active, loading spinner is not active", () => {
    // Arrange
    const target = BaseLoadingTargets.ActiveView;
    const children = <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit.</p>;

    // Act
    renderWithProviders(<LoadingSpinner target={target}>{children}</LoadingSpinner>, store, fakeRouterHistory);

    // Verify
    const loadingSpinner = screen.getByTestId(`LoadingSpinner__${target}`);
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveAttribute("data-loading", "false");
});

test("When target is active, loading spinner is active", () => {
    // Arrange
    const target = BaseLoadingTargets.ActiveView;
    const children = <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit.</p>;
    renderWithProviders(<LoadingSpinner target={target}>{children}</LoadingSpinner>, store, fakeRouterHistory);

    // Act
    act(() => {
        store.dispatch(Common.Actions.showLoader(target));
    });

    // Verify
    const loadingSpinner = screen.getByTestId(`LoadingSpinner__${target}`);
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveAttribute("data-loading", "true");
});

test("When another target is activating, loading spinner stays inactive", () => {
    // Arrange
    const target1 = BaseLoadingTargets.ActiveView;
    const target2 = BaseLoadingTargets.WholePage;
    const children = <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit.</p>;
    renderWithProviders(<LoadingSpinner target={target1}>{children}</LoadingSpinner>, store, fakeRouterHistory);

    // Act
    act(() => {
        store.dispatch(Common.Actions.showLoader(target2));
    });

    // Verify
    const loadingSpinner = screen.getByTestId(`LoadingSpinner__${target1}`);
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveAttribute("data-loading", "false");
});
