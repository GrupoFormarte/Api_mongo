export const processFileWithRoute = (data: string) => {
    const lines = data.split('\n');
    const result: Array<{
      userId: string;
      fileRoute: string | null;
      sectionOne: Array<{ question: number; answer: string | null }>;
      sectionTwo: Array<{ question: number; answer: string | null }>;
    }> = [];
  
    lines.forEach((line) => {
      const userData = line.split(',');
      const userId = userData[0].trim();
      const answers = userData.slice(1);
  
      // Encuentra el índice de la sección de archivos (comienza con 'file://')
      const indexOfFileSection = answers.findIndex((answer) => answer.startsWith('file://'));
      const fileRoute = indexOfFileSection !== -1 ? answers[indexOfFileSection] : null;
  
      const sectionOne = answers
        .slice(0, indexOfFileSection)
        .map((answer, i) => ({ question: i + 1, answer: answer.trim() || null }));
  
      const sectionTwo = answers
        .slice(indexOfFileSection + 1)
        .map((answer, i) => ({
          question: indexOfFileSection + i + 1,
          answer: answer.trim() || null,
        }));
  
      result.push({
        userId,
        fileRoute,
        sectionOne,
        sectionTwo,
      });
    });
  
    return result;
  };