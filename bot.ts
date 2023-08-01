import { Bot, InlineKeyboard, Keyboard, Context } from "grammy";
import { I18n, I18nFlavor } from "@grammyjs/i18n";
import dotenv from "dotenv";
import commands from "./commands.json";
import { QandA } from "./qa";

type MyContext = Context & I18nFlavor;

dotenv.config();
const Token: string = process.env.TOKEN || "";
const bot = new Bot<MyContext>(Token);

const i18n = new I18n<MyContext>({
  defaultLocale: "fa",
  directory: "locales",
  globalTranslationContext: function g(ctx: Context) {
    return {
      name: ctx.from?.first_name || "",
    };
  },
});
bot.use(i18n);

// const QA = Promise.resolve(QandA.build());
const QA = QandA.build();

bot.api.setMyCommands(commands);

const customInline = new InlineKeyboard()
  .text("first option")
  .row()
  .text("second option")
  .row()
  .switchInline("third option");

const productsKeyborad = new Keyboard()
  .oneTime()
  .text("فطیر")
  .text("رب")
  .row()
  .text("لواشک")
  .text("روغن")
  .row();

bot.command("start", async (ctx) => {
  await ctx.reply(ctx.t("start"));
});

bot.command("products", (ctx) =>
  ctx.reply("Displaying our products", { reply_markup: productsKeyborad })
);

bot.command("custom", (ctx) =>
  ctx.reply("Custom Command", {
    reply_markup: customInline,
  })
);

bot.hears("روغن", (ctx) => {
  ctx.reply("شما روغن را انتخاب کردید");
});

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.on("message:text", async (ctx) => {
  let answer = "";
  console.log((await QA).code);
  answer = (await (await QA).ask(ctx.message.text)).text;
  try {
    ctx.reply(answer);
  } catch (error) {
    console.log(error);
  }
});

bot.start({
  onStart: async (u) => {
    u.username;
  },
});
