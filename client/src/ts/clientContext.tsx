import { CreateTRPCProxyClient } from '@trpc/client';
import { createContext } from 'react';
import { AppRouter } from '../../../server/routers';

export const TrpcContext = createContext<CreateTRPCProxyClient<AppRouter> | undefined>(undefined);