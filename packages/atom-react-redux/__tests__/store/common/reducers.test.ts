import * as actions from "@/common/actions";
import commonReducer from "@/common/reducers";

describe("commonReducer", () => {
    test("Given unknown action Then returns initial state", () => {
        // Act
        const result = commonReducer(undefined, { type: "unknown/action" });

        // Verify
        expect(result.loadingTargets).toEqual({});
    });

    test("Given showLoader repeatedly Then increments counter", () => {
        // Act
        let state = commonReducer(undefined, actions.showLoader(5));
        state = commonReducer(state, actions.showLoader(5));

        // Verify
        expect(state.loadingTargets[5]).toBe(2);
    });

    test("Given hideLoader on existing target Then decrements and removes at zero", () => {
        // Arrange
        let state = commonReducer(undefined, actions.showLoader(3));
        state = commonReducer(state, actions.showLoader(3));

        // Act
        state = commonReducer(state, actions.hideLoader(3));

        // Verify
        expect(state.loadingTargets[3]).toBe(1);

        // Act
        state = commonReducer(state, actions.hideLoader(3));

        // Verify
        expect(state.loadingTargets[3]).toBeUndefined();
    });

    test("Given hideLoader on missing target Then keeps state clean", () => {
        // Act
        const state = commonReducer(undefined, actions.hideLoader(8));

        // Verify
        expect(state.loadingTargets[8]).toBeUndefined();
        expect(state.loadingTargets).toEqual({});
    });

    test("Given hideAllLoaders Then clears all active targets", () => {
        // Arrange
        let state = commonReducer(undefined, actions.showLoader(1));
        state = commonReducer(state, actions.showLoader(2));

        // Act
        state = commonReducer(state, actions.hideAllLoaders());

        // Verify
        expect(state.loadingTargets).toEqual({});
    });

    test("Given parametrized targets Then tracks each param independently", () => {
        // Act
        let state = commonReducer(undefined, actions.showLoader(100, 7));
        state = commonReducer(state, actions.showLoader(100, 8));

        // Verify
        expect(state.loadingTargets["100:7"]).toBe(1);
        expect(state.loadingTargets["100:8"]).toBe(1);
        expect(state.loadingTargets["100"]).toBeUndefined();

        // Act
        state = commonReducer(state, actions.hideLoader(100, 7));

        // Verify
        expect(state.loadingTargets["100:7"]).toBeUndefined();
        expect(state.loadingTargets["100:8"]).toBe(1);
    });

    test("Given a parametrized and an unparametrized target sharing a number Then they do not collide", () => {
        // Act
        let state = commonReducer(undefined, actions.showLoader(100));
        state = commonReducer(state, actions.showLoader(100, 7));

        // Verify
        expect(state.loadingTargets["100"]).toBe(1);
        expect(state.loadingTargets["100:7"]).toBe(1);
    });
});
