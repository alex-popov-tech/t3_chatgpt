import OpenAI from "openai";
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
    history: Message[] = [],
  ): Promise<{ input: Message; output: Message }> {
    console.log("openai.ask", { inputContent, history });
    const input = {
      role: "user",
      content: inputContent,
    } as Message;
    const res = await openai.chat.completions.create({
      model: this.model,
      messages: [
        ...history,
        { ...input, content: `${input.content}\n---${this.constraints}\n---` },
      ],
    });
    const outputContent = res?.choices[0]?.message?.content ?? "";
    const output = { role: "assistant", content: outputContent } as Message;
    console.log("openai.ask return", { input, output });
    return { input, output };
  }
}
