import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type Message, OpenaiChat } from "~/server/openaiChat";

const chat = new OpenaiChat();

export const conversationRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx?.session?.user?.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can't list conversations",
      });
    }
    const userId = ctx.session.user.id;
    const conversations = await ctx.db.conversation.findMany({
      where: { createdById: userId },
    });
    return conversations;
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
    .mutation(async function* ({ ctx, input: args }) {
      const userId = ctx.session.user.id;

      const input = { content: args.content, role: "user" } as Message;
      const output = await chat.ask(args.content, { stream: true });

      // draining stream
      let outputContent = "";
      for await (const chunk of output) {
        const content = chunk.choices[0]?.delta.content ?? "";
        yield content;
        outputContent += content;
      }
      const outputMessage = {
        content: outputContent,
        role: "assistant",
      } as Message;

      const title = await chat.makeTitle([input, outputMessage]);

      const conversation = await ctx.db.conversation.create({
        data: {
          createdById: userId,
          title: title,
          messages: {
            createMany: {
              data: [
                { content: args.content, role: "USER" },
                { content: outputContent, role: "ASSISTANT" },
              ],
            },
          },
        },
        include: { messages: true },
      });

      yield { conversation };
    }),

  update: protectedProcedure
    .input(z.object({ convId: z.number(), content: z.string().min(1) }))
    .mutation(async function* ({ ctx, input: args }) {
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

      // update title every 5 messages until 20
      if (conv.messages.length % 4 && conv.messages.length < 12) {
        const title = await chat.makeTitle(history);
        await ctx.db.conversation.update({
          where: { id: args.convId },
          data: { title },
        });
      }

      const output = await chat.ask(args.content, { history, stream: true });

      // draining stream
      let outputContent = "";
      for await (const chunk of output) {
        const chunkContent = chunk.choices[0]?.delta.content ?? "";
        yield chunkContent;
        outputContent += chunkContent;
      }

      const outputMessage = await ctx.db.message.create({
        data: {
          content: outputContent,
          role: "ASSISTANT",
          conversationId: args.convId,
        },
      });
      yield { output: outputMessage, input: inputMessage };
    }),
});
