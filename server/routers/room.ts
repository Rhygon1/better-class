import { t } from "../trpc";
import { z } from "zod";
import { Room } from '../server'

function generateRandomString(length: number) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const roomRouter = t.router({
  check: t.procedure.input(z.string()).query(({ input, ctx }) => {
    return { exists: Object.keys(ctx.rooms).includes(input) };
  }),
  create: t.procedure.mutation(({ctx}) => {
    let newID = generateRandomString(6).toLowerCase();
    while (ctx.rooms[newID]) newID = generateRandomString(6).toLowerCase();
    ctx.rooms[newID] = new Room();
    console.log(ctx.rooms);

    return { code: newID }

  }),
});
