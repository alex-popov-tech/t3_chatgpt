import OpenAI from "openai";
import { type Stream } from "openai/streaming.mjs";
import { env } from "~/env";

export type Role = "USER" | "ASSISTANT";
export type Message = { role: Lowercase<Role>; content: string };
export type Model = "gpt-4o";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export class OpenaiChat {
  private readonly constraints =
    "Constraints: Do not include pretext or context, only return the answer.";
  private model: Model;

  constructor({ model }: { model: Model } = { model: "gpt-4o" }) {
    this.model = model;
  }

  async makeTitle(history: Message[]): Promise<string> {
    const input = {
      role: "user",
      content: "Make a title for this chat which consist of few words",
    } as Message;
    const res = await openai.chat.completions.create({
      model: this.model,
      messages: [
        ...history,
        { ...input, content: `${input.content}\n---${this.constraints}\n---` },
      ],
    });
    const outputContent = res?.choices[0]?.message?.content ?? "";
    return outputContent;
  }

  async ask(
    inputContent: string,
    opts?: { history?: Message[]; stream?: false },
  ): Promise<OpenAI.Chat.Completions.ChatCompletion>;
  async ask(
    inputContent: string,
    opts?: { history?: Message[]; stream: true },
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>>;
  async ask(
    inputContent: string,
    opts?: { history?: Message[]; stream?: boolean },
  ): Promise<
    | Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
    | OpenAI.Chat.Completions.ChatCompletion
  > {
    console.log("openai.ask", { inputContent, opts });
    const input = { role: "user", content: inputContent } as Message;
    const output = await openai.chat.completions.create({
      stream: opts?.stream,
      model: this.model,
      messages: [
        ...(opts?.history ?? []),
        { ...input, content: `${input.content}\n---${this.constraints}\n---` },
      ],
    });
    console.log("openai.ask return", { input, output });
    return output;
  }
}
