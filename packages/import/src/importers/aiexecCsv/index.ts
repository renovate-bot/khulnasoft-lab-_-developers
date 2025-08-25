import * as inquirer from "inquirer";

import { Importer } from "../../types";
import { AiexecCsvImporter } from "./AiexecCsvImporter";

const BASE_PATH = process.cwd();

export const aiexecCsvImporter = async (): Promise<Importer> => {
  const answers = await inquirer.prompt<AiexecImportAnswers>(questions);
  const aiexecImporter = new AiexecCsvImporter(answers.aiexecFilePath);
  return aiexecImporter;
};

interface AiexecImportAnswers {
  aiexecFilePath: string;
}

const questions = [
  {
    basePath: BASE_PATH,
    type: "filePath",
    name: "aiexecFilePath",
    message: "Select your exported CSV file of Aiexec issues",
  },
];
