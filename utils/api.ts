import { Question } from '../types';

const BASE_URL = 'https://opentdb.com';

// Helper to wait/sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchCategories = async () => {
  const response = await fetch(`${BASE_URL}/api_category.php`);
  const data = await response.json();
  return data.trivia_categories;
};

export const fetchQuestions = async (
  categoryId: number,
  difficulty: string,
  retryCount: number = 0
): Promise<{ questions: Question[], warning?: string }> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 3000; // 3 seconds

  let url = `${BASE_URL}/api.php?amount=25&category=${categoryId}&type=multiple&encode=url3986`;

  if (difficulty && difficulty !== 'mixed') {
    url += `&difficulty=${difficulty}`;
  }

  console.log('Fetching from URL:', url);

  try {
    const response = await fetch(url);

    // Handle 429 Too Many Requests
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        console.log(`⚠️ Rate limited (429). Waiting ${RETRY_DELAY}ms before retry ${retryCount + 1}/${MAX_RETRIES}...`);
        await sleep(RETRY_DELAY);
        return fetchQuestions(categoryId, difficulty, retryCount + 1);
      } else {
        throw new Error('Too many requests to the quiz API. Please wait a minute and try again.');
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log('API Response:', data);

    // Handle different response codes
    if (data.response_code === 1) {
      // Try with fewer questions
      console.log('Not enough questions for 25, trying with 10...');

      // Wait a bit before retry to avoid 429
      await sleep(1000);

      const retryUrl = `${BASE_URL}/api.php?amount=10&category=${categoryId}&type=multiple&encode=url3986${difficulty && difficulty !== 'mixed' ? `&difficulty=${difficulty}` : ''}`;

      try {
        const retryResponse = await fetch(retryUrl);

        // Handle 429 on retry
        if (retryResponse.status === 429) {
          if (retryCount < MAX_RETRIES) {
            console.log(`⚠️ Rate limited on retry. Waiting ${RETRY_DELAY}ms...`);
            await sleep(RETRY_DELAY);
            return fetchQuestions(categoryId, difficulty, retryCount + 1);
          } else {
            throw new Error('Too many requests. Please wait a minute and try again.');
          }
        }

        const retryData = await retryResponse.json();

        if (retryData.response_code === 0 && retryData.results && retryData.results.length >= 5) {
          const questions = retryData.results.map((q: any) => {
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

          return {
            questions,
            warning: `Only ${questions.length} questions available for this category/difficulty. Quiz will proceed with ${questions.length} questions.`
          };
        }
      } catch (retryError: any) {
        console.error('Retry fetch error:', retryError);
        // If retry fails, throw the original error
      }

      throw new Error('No questions available for this category/difficulty combination. Please try a different selection.');
    } else if (data.response_code === 2) {
      throw new Error('Invalid parameters. Please try again.');
    } else if (data.response_code === 3) {
      throw new Error('Session token not found. Please refresh and try again.');
    } else if (data.response_code === 4) {
      throw new Error('Session token expired. Please refresh and try again.');
    } else if (data.response_code !== 0) {
      throw new Error('Unknown error from quiz API. Please try again.');
    }

    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      throw new Error('No questions returned from API.');
    }

    const questions = data.results.map((q: any) => {
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

    const warning = questions.length < 25 ? `Only ${questions.length} questions available for this category/difficulty.` : undefined;

    return { questions, warning };
  } catch (error: any) {
    console.error('Fetch questions error:', error);

    // If it's a 429 error and we haven't exceeded retries, retry
    if (error.message.includes('Too many requests') && retryCount < MAX_RETRIES) {
      console.log(`⚠️ Retrying after error... (${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY);
      return fetchQuestions(categoryId, difficulty, retryCount + 1);
    }

    throw error;
  }
};