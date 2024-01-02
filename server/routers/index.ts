import { t } from '../trpc'
import { roomRouter } from './room'
import { userRouter } from './users'

export const appRouter = t.router({
    rooms: roomRouter,
    users: userRouter
})

export type AppRouter = typeof appRouter