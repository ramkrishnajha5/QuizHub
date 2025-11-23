import { Question } from '../types';

const BASE_URL = 'https://opentdb.com';

export const fetchQuestions = async (
  categoryId: number,
  difficulty: string
): Promise<Question[]> => {
  let url = `${BASE_URL}/api.php?amount=25&category=${categoryId}&type=multiple&encode=url3986`;
  
  if (difficulty && difficulty !== 'mixed') {
    url += `&difficulty=${difficulty}`;
  }

  const response = await fetch(url);
  const data = await response.json();

  if (data.response_code !== 0) {
    // Retry once if token issue or empty (simple retry logic for empty results)
    const retryRes = await fetch(url);
    const retryData = await retryRes.json();
    if(retryData.response_code !== 0) {
       throw new Error('Failed to fetch questions. Try a different category or difficulty.');
    }
    return mapQuestions(retryData.results);
  }

  return mapQuestions(data.results);
};

const mapQuestions = (results: any[]): Question[] => {
  return results.map((q: any) => {
    // Decode URL encoded strings
    const decode = (str: string) => decodeURIComponent(str);
    
    const incorrect = q.incorrect_answers.map(decode);
    const correct = decode(q.correct_answer);
    const all = [...incorrect, correct].sort(() => Math.random() - 0.5);

    return {
      category: decode(q.category),
      type: decode(q.type),
      difficulty: decode(q.difficulty),
      question: decode(q.question),
      correct_answer: correct,
      incorrect_answers: incorrect,
      all_answers: all
    };
  });
}
