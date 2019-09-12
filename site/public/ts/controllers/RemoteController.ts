import {AuthState} from "../utils/auth/AuthState";
import {CircuitMetadata} from "../models/CircuitMetadata";
import {CreateUserCircuit, UpdateUserCircuit, QueryUserCircuits} from "../utils/api/Circuits";

export const RemoteController = (() => {
    interface RemoteData {
        authState?: AuthState;
        metadata?: CircuitMetadata;
    }
    let promiseChain: Promise<RemoteData> =
            new Promise((resolve, _) => resolve({
                authState: undefined,
                metadata: undefined
            }));

    function Chain(body: (data: RemoteData) => Promise<RemoteData | void>, requireAuth: boolean = false): void {
        promiseChain = promiseChain.then(async (data: RemoteData) => {
            // Require an AuthState or exit
            if (requireAuth && !data.authState) {
                return {
                    authState: undefined,
                    metadata: data.metadata
                }
            }

            const newData = await body(data);
            return {
                // Make it easier for caller of 'Chain' to only specify
                //  the properties they're changing or nothing at all
                authState: (newData && "authState" in newData ? newData.authState : data.authState),
                metadata:  (newData && "metadata"  in newData ? newData.metadata  : data.metadata)
            }
        });
    }

    return {
        Login(as: AuthState, callback: () => Promise<void> | void = Promise.resolve): void {
            Chain(async (data: RemoteData) => {
                if (data.authState) {
                    console.error("Attempt to load multiple auth states!");
                    await data.authState.logOut();
                }
                await callback();
                return {
                    authState: as
                };
            });
        },
        Logout(callback: () => Promise<void> | void = Promise.resolve): void {
            Chain(async (data: RemoteData) => {
                if (data.authState)
                    await data.authState.logOut();
                await callback();
                return {
                    authState: undefined
                }
            });
        },
        SaveCircuit(circuitData: string, callback: () => Promise<void> | void = Promise.resolve): void {
            Chain(async (data: RemoteData) => {
                // Decide whether to update current circuit or create new one
                const metadata: CircuitMetadata = !data.metadata ?
                    await CreateUserCircuit(data.authState, circuitData) :
                    await UpdateUserCircuit(data.authState, data.metadata.getId(), circuitData);

                await callback();
                return {
                    metadata: metadata
                };
            }, true);
        },
        ListCircuits(callback: (list: CircuitMetadata[]) => Promise<void> | void = Promise.resolve): void {
            Chain(async (data: RemoteData) => {
                // Query list of circuits
                const list = await QueryUserCircuits(data.authState);
                await callback(list);
            }, true);
        }
    }
})();
