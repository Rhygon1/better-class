import { t } from "../trpc";
import { z } from "zod";
import clerkClient from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";

export const userRouter = t.router({
  getByID: t.procedure.input(z.string().min(1)).query(async ({ input }) => {
    try {
      let userInfo = await clerkClient.users.getUser(input);
      let name = userInfo.username;
      if (userInfo.username == undefined) {
        name = userInfo.firstName;
        console.log(name);
      }
      return {
        username: name,
        hasPfp: userInfo.hasImage,
        pfpUrl: userInfo.imageUrl,
      };
    } catch (e) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
