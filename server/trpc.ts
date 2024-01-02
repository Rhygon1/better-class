import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { createContext } from './server'

export const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create()

