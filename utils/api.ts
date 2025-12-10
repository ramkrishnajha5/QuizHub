import { Question } from '../types';

const BASE_URL = 'https://opentdb.com';

// Helper to wait/sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to shuffle an array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const fetchCategories = async () => {
  const response = await fetch(`${BASE_URL}/api_category.php`);
  const data = await response.json();
  return data.trivia_categories;
};

export const fetchQuestions = async (
  categoryId: number,
  questionCount: number,
  retryCount: number = 0
): Promise<{ questions: Question[], warning?: string }> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 3000; // 3 seconds

  // Fetch extra questions to allow for randomization
  // Request 2x the needed amount (or max 50) to have a pool to randomize from
  const fetchAmount = Math.min(questionCount * 2, 50);

  let url = `${BASE_URL}/api.php?amount=${fetchAmount}&category=${categoryId}&type=multiple&encode=url3986`;

  console.log('Fetching from URL:', url, `(requesting ${fetchAmount} to select random ${questionCount})`);

  try {
    const response = await fetch(url);

    // Handle 429 Too Many Requests
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        console.log(`⚠️ Rate limited (429). Waiting ${RETRY_DELAY}ms before retry ${retryCount + 1}/${MAX_RETRIES}...`);
        await sleep(RETRY_DELAY);
        return fetchQuestions(categoryId, questionCount, retryCount + 1);
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
      // Not enough questions, try with the exact amount needed
      console.log(`Not enough questions for ${fetchAmount}, trying with ${questionCount}...`);

      await sleep(1000);

      const retryUrl = `${BASE_URL}/api.php?amount=${questionCount}&category=${categoryId}&type=multiple&encode=url3986`;

      try {
        const retryResponse = await fetch(retryUrl);

        if (retryResponse.status === 429) {
          if (retryCount < MAX_RETRIES) {
            console.log(`⚠️ Rate limited on retry. Waiting ${RETRY_DELAY}ms...`);
            await sleep(RETRY_DELAY);
            return fetchQuestions(categoryId, questionCount, retryCount + 1);
          } else {
            throw new Error('Too many requests. Please wait a minute and try again.');
          }
        }

        const retryData = await retryResponse.json();

        if (retryData.response_code === 0 && retryData.results && retryData.results.length >= Math.min(5, questionCount)) {
          const questions: Question[] = retryData.results.map((q: any) => {
            const decode = (str: string) => decodeURIComponent(str);
            const incorrect = q.incorrect_answers.map(decode);
            const correct = decode(q.correct_answer);
            const all = shuffleArray([...incorrect, correct]);

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

          // Shuffle the questions themselves
          const shuffledQuestions = shuffleArray(questions);

          return {
            questions: shuffledQuestions.slice(0, questionCount),
            warning: questions.length < questionCount ?
              `Only ${questions.length} questions available for this category. Quiz will proceed with ${questions.length} questions.` :
              undefined
          };
        }
      } catch (retryError: any) {
        console.error('Retry fetch error:', retryError);
      }

      throw new Error('No questions available for this category. Please try a different selection.');
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

    const questions: Question[] = data.results.map((q: any) => {
      const decode = (str: string) => decodeURIComponent(str);

      const incorrect = q.incorrect_answers.map(decode);
      const correct = decode(q.correct_answer);
      // Shuffle answer options
      const all = shuffleArray([...incorrect, correct]);

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

    // Shuffle the questions themselves to randomize order
    const shuffledQuestions = shuffleArray(questions);

    // Take only the requested number of questions
    const selectedQuestions = shuffledQuestions.slice(0, questionCount);

    const warning = questions.length < questionCount ?
      `Only ${questions.length} questions available for this category. Quiz will proceed with ${questions.length} questions.` :
      undefined;

    console.log(`✅ Successfully fetched and randomized ${selectedQuestions.length} questions from a pool of ${questions.length}`);

    return { questions: selectedQuestions, warning };
  } catch (error: any) {
    console.error('Fetch questions error:', error);

    // If it's a 429 error and we haven't exceeded retries, retry
    if (error.message.includes('Too many requests') && retryCount < MAX_RETRIES) {
      console.log(`⚠️ Retrying after error... (${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY);
      return fetchQuestions(categoryId, questionCount, retryCount + 1);
    }

    throw error;
  }
};