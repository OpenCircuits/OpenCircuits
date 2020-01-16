import {AuthState} from "../../digital/auth/AuthState";
import {CircuitMetadata} from "core/models/CircuitMetadata";
import {CreateUserCircuit, UpdateUserCircuit,
        QueryUserCircuits, LoadUserCircuit,
        DeleteUserCircuit} from "../api/Circuits";
import {LoadExampleCircuit} from "../api/Example";

export const RemoteController = (() => {
    interface RemoteData {
        authState?: AuthState;
        metadata?: CircuitMetadata;
    }
    let promiseChain: Promise<RemoteData> =
            new Promise((resolve, _) => resolve({
                authState: undefined,
                metadata: CircuitMetadata.Default()
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
                await data.authState.logOut();
                await callback();
                return {
                    authState: undefined,
                    metadata: CircuitMetadata.Default()
                }
            }, true);
        },
        SaveCircuit(circuitData: string, callback: () => Promise<void> | void = Promise.resolve): void {
            Chain(async (data: RemoteData) => {
                // Decide whether to update current circuit or create new one
                const metadata: CircuitMetadata = !data.metadata.getId() ?
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
        },
        LoadExampleCircuit(metadata: CircuitMetadata, callback: (contents: string) => Promise<void> | void = Promise.resolve): void {
            Chain(async (_data: RemoteData) => {
                const contents = await LoadExampleCircuit(metadata);
                callback(contents);
                return {
                    metadata: CircuitMetadata.Default()
                };
            });
        },
        LoadUserCircuit(metadata: CircuitMetadata, callback: (contents: string) => Promise<void> | void = Promise.resolve): void {
            Chain(async (data: RemoteData) => {
                const contents = await LoadUserCircuit(data.authState, metadata.getId());
                callback(contents);
                return {
                    metadata: metadata
                };
            }, true);
        },
        DeleteUserCircuit(metadata: CircuitMetadata, callback: (result: boolean) => Promise<void> | void = Promise.resolve): void {
            Chain(async (data: RemoteData) => {
                const result = await DeleteUserCircuit(data.authState, metadata.getId());
                callback(result);
                if (data.metadata !== undefined && data.metadata.getId() === metadata.getId()) {
                    return {
                        metadata: metadata.buildOn().withId("").build()
                    }
                }
            }, true);
        }
    }
})();
