import { ElectronAPIResponse } from "./base";
import { Question } from "./schemas";

export type ElectronAPIs = {
  getQuestions: () => Promise<ElectronAPIResponse<Question[]>>;
  sendAnswers: (answers: string[]) => Promise<ElectronAPIResponse<void>>;
};
