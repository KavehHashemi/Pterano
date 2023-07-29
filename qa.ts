import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { BufferMemory } from "langchain/memory";
import * as fs from "fs";

import dotenv from "dotenv";
dotenv.config();

export const QA = async (question: string) => {
  /* Initialize the LLM to use to answer the question */
  const model = new ChatOpenAI({});
  /* Load in the file we want to do question answering over */
  const text = fs.readFileSync("cv.txt", "utf8");
  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);
  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

  /* Create the chain */
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      memory: new BufferMemory({
        memoryKey: "chat_history", // Must be set to "chat_history"
      }),
    }
  );
  /* Ask it a question */
  // const question = "What is the author's name?";
  const res = await chain.call({ question });

  return res;
  /* Ask it a follow up question */
  // const followUpRes = await chain.call({
  //   question: "What is his email?",
  // });
  // console.log(followUpRes);
  // const finalQuestion = await chain.call({
  //   question: "Does the author know german?",
  // });
  // console.log(finalQuestion);
};

// run();
