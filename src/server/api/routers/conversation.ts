import { TRPCError } from "@trpc/server";
import EventEmitter from "events";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { type Message, OpenaiChat } from "~/server/openaiChat";

const chat = new OpenaiChat();
const ee = new EventEmitter();

export const conversationRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const conversations = await ctx.db.conversation.findMany({
      where: { createdById: userId },
    });
    return { conversations };
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const convId = input.id;
      const conversation = await ctx.db.conversation.findUnique({
        where: { id: convId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (conversation?.createdById !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "That is not your conversation",
        });
      }

      return conversation;
    }),

  create: protectedProcedure
    .input(z.object({ content: z.string().min(1) }))
    .mutation(async ({ ctx, input: args }) => {
      const userId = ctx.session.user.id;
      const chat = new OpenaiChat();
      const { input, output } = await chat.ask(args.content);
      const title = await chat.makeTitle([input, output]);

      const conversation = await ctx.db.conversation.create({
        data: { createdById: userId, title },
      });
      await ctx.db.message.create({
        data: {
          conversationId: conversation.id,
          content: input.content,
          role: "USER",
        },
      });
      await ctx.db.message.create({
        data: {
          conversationId: conversation.id,
          content: output.content,
          role: "ASSISTANT",
        },
      });
      const result = await ctx.db.conversation.findUnique({
        where: { id: conversation.id },
        include: { messages: true },
      });

      return { conversation: result };
    }),

  update: protectedProcedure
    .input(z.object({ convId: z.number(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input: args }) => {
      const userId = ctx.session.user.id;

      const conv = await ctx.db.conversation.findUnique({
        where: { id: args.convId },
        include: { messages: true },
      });
      if (conv?.createdById !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "That is not your conversation",
        });
      }

      const inputMessage = await ctx.db.message.create({
        data: {
          content: args.content,
          role: "USER",
          conversationId: args.convId,
        },
      });

      const history = conv.messages.map(
        ({ content, role }) =>
          ({
            content,
            role: role.toLowerCase(),
          }) as Message,
      );
      const { output } = await chat.ask(args.content, history);

      const outputMessage = await ctx.db.message.create({
        data: {
          content: output.content,
          role: "ASSISTANT",
          conversationId: args.convId,
        },
      });
      return { input: inputMessage, output: outputMessage };
    }),

  test: publicProcedure.query(async function* () {
    console.log("start procedure");
    for (let i = 0; i < 100; i++) {
      console.log("before await");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("before yield");
      yield i;
      console.log("after yield");
    }
  }),
});
