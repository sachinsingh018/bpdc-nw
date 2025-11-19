/**
 * Script to add more questions to existing skills
 * Run with: npx tsx scripts/add-skill-questions.ts
 */

import { db } from '@/lib/db/queries';
import { skillQuestions, skills } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Question templates for different skills
const questionTemplates: { [key: string]: Array<{ question: string; options: string[]; correctIndex: number }> } = {
    'JavaScript': [
        { question: 'What is the output of: console.log(typeof null)?', options: ['null', 'object', 'undefined', 'boolean'], correctIndex: 1 },
        { question: 'Which method is used to add an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correctIndex: 0 },
        { question: 'What does the "this" keyword refer to in a regular function?', options: ['The function itself', 'The global object', 'The object that called the function', 'undefined'], correctIndex: 2 },
        { question: 'What is a closure in JavaScript?', options: ['A function that has no parameters', 'A function that has access to variables in its outer scope', 'A function that returns undefined', 'A function that is called immediately'], correctIndex: 1 },
        { question: 'What is the difference between == and ===?', options: ['No difference', '== checks value, === checks value and type', '=== checks value, == checks value and type', 'Both check only type'], correctIndex: 1 },
        { question: 'What is the purpose of the async/await keywords?', options: ['To make code synchronous', 'To handle asynchronous operations', 'To create loops', 'To define variables'], correctIndex: 1 },
        { question: 'What is a Promise in JavaScript?', options: ['A function that returns immediately', 'An object representing eventual completion of an async operation', 'A type of loop', 'A way to declare variables'], correctIndex: 1 },
        { question: 'What does the spread operator (...) do?', options: ['Removes elements from an array', 'Expands an iterable into individual elements', 'Combines two arrays', 'Sorts an array'], correctIndex: 1 },
    ],
    'Python': [
        { question: 'What is the correct way to create a list in Python?', options: ['list = []', 'list = list()', 'list = [] or list()', 'All of the above'], correctIndex: 3 },
        { question: 'What is a dictionary in Python?', options: ['A list of keys', 'A collection of key-value pairs', 'A type of loop', 'A function'], correctIndex: 1 },
        { question: 'What does len() function do?', options: ['Returns the length of a string', 'Returns the length of a list', 'Returns the length of various data types', 'All of the above'], correctIndex: 3 },
        { question: 'What is a tuple in Python?', options: ['A mutable sequence', 'An immutable sequence', 'A dictionary', 'A set'], correctIndex: 1 },
        { question: 'What is list comprehension?', options: ['A way to create lists', 'A concise way to create lists', 'A type of loop', 'A function'], correctIndex: 1 },
        { question: 'What does the "self" parameter represent?', options: ['The class itself', 'The instance of the class', 'A method', 'A variable'], correctIndex: 1 },
        { question: 'What is the difference between append() and extend()?', options: ['No difference', 'append adds one element, extend adds multiple', 'extend adds one element, append adds multiple', 'Both add multiple elements'], correctIndex: 1 },
        { question: 'What is a decorator in Python?', options: ['A function that modifies another function', 'A type of variable', 'A loop construct', 'A data structure'], correctIndex: 0 },
    ],
    'React': [
        { question: 'What is JSX?', options: ['A JavaScript library', 'A syntax extension for JavaScript', 'A CSS framework', 'A database'], correctIndex: 1 },
        { question: 'What is a React component?', options: ['A function or class that returns JSX', 'A variable', 'A loop', 'A database query'], correctIndex: 0 },
        { question: 'What is the purpose of useState hook?', options: ['To fetch data', 'To manage component state', 'To style components', 'To create routes'], correctIndex: 1 },
        { question: 'What is the purpose of useEffect hook?', options: ['To manage state', 'To perform side effects', 'To create components', 'To handle events'], correctIndex: 1 },
        { question: 'What is props in React?', options: ['Properties passed to components', 'A state management tool', 'A routing library', 'A styling framework'], correctIndex: 0 },
        { question: 'What is the virtual DOM?', options: ['A real DOM element', 'A JavaScript representation of the DOM', 'A CSS framework', 'A database'], correctIndex: 1 },
        { question: 'What is the difference between controlled and uncontrolled components?', options: ['No difference', 'Controlled uses state, uncontrolled uses refs', 'Uncontrolled uses state, controlled uses refs', 'Both use refs'], correctIndex: 1 },
        { question: 'What is React Router used for?', options: ['State management', 'Navigation and routing', 'Styling', 'Data fetching'], correctIndex: 1 },
    ],
    'Node.js': [
        { question: 'What is Node.js?', options: ['A database', 'A JavaScript runtime built on Chrome\'s V8', 'A CSS framework', 'A browser'], correctIndex: 1 },
        { question: 'What is npm?', options: ['Node Package Manager', 'Node Program Manager', 'Node Process Manager', 'Node Project Manager'], correctIndex: 0 },
        { question: 'What is the purpose of require()?', options: ['To export modules', 'To import modules', 'To create modules', 'To delete modules'], correctIndex: 1 },
        { question: 'What is Express.js?', options: ['A database', 'A web application framework', 'A CSS framework', 'A browser'], correctIndex: 1 },
        { question: 'What is middleware in Express?', options: ['A database', 'Functions that execute during request-response cycle', 'A routing mechanism', 'A template engine'], correctIndex: 1 },
        { question: 'What is the difference between require() and import?', options: ['No difference', 'require is CommonJS, import is ES6', 'import is CommonJS, require is ES6', 'Both are ES6'], correctIndex: 1 },
        { question: 'What is the purpose of process.env?', options: ['To access environment variables', 'To create variables', 'To delete variables', 'To modify the process'], correctIndex: 0 },
        { question: 'What is a callback function?', options: ['A function passed as an argument', 'A function that returns immediately', 'A synchronous function', 'A database query'], correctIndex: 0 },
    ],
    'SQL': [
        { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'], correctIndex: 0 },
        { question: 'What is the purpose of SELECT statement?', options: ['To insert data', 'To retrieve data', 'To delete data', 'To update data'], correctIndex: 1 },
        { question: 'What is a primary key?', options: ['A foreign key', 'A unique identifier for a row', 'A type of join', 'A database name'], correctIndex: 1 },
        { question: 'What is the difference between INNER JOIN and LEFT JOIN?', options: ['No difference', 'INNER returns matching rows, LEFT returns all left rows', 'LEFT returns matching rows, INNER returns all left rows', 'Both return all rows'], correctIndex: 1 },
        { question: 'What is the purpose of WHERE clause?', options: ['To filter rows', 'To sort rows', 'To group rows', 'To join tables'], correctIndex: 0 },
        { question: 'What is a foreign key?', options: ['A primary key', 'A key that references another table', 'A unique constraint', 'A database name'], correctIndex: 1 },
        { question: 'What does GROUP BY do?', options: ['Groups rows by a column', 'Sorts rows', 'Filters rows', 'Joins tables'], correctIndex: 0 },
        { question: 'What is the purpose of HAVING clause?', options: ['To filter rows', 'To filter groups', 'To sort rows', 'To join tables'], correctIndex: 1 },
    ],
};

async function addQuestionsToSkills() {
    try {
        // Get all skills
        const allSkills = await db.select().from(skills);

        for (const skill of allSkills) {
            // Check how many questions this skill already has
            const existingQuestions = await db
                .select()
                .from(skillQuestions)
                .where(eq(skillQuestions.skillId, skill.id));

            console.log(`Skill "${skill.name}" currently has ${existingQuestions.length} questions`);

            // Get questions for this skill type
            const questionsToAdd = questionTemplates[skill.name] || [];

            if (questionsToAdd.length === 0) {
                console.log(`No question template found for "${skill.name}", skipping...`);
                continue;
            }

            // Add questions if we have less than 10
            if (existingQuestions.length < 10) {
                const questionsNeeded = 10 - existingQuestions.length;
                const questionsToInsert = questionsToAdd
                    .slice(0, Math.min(questionsNeeded, questionsToAdd.length))
                    .map(q => ({
                        skillId: skill.id,
                        question: q.question,
                        options: q.options,
                        correctIndex: q.correctIndex,
                    }));

                if (questionsToInsert.length > 0) {
                    await db.insert(skillQuestions).values(questionsToInsert);
                    console.log(`Added ${questionsToInsert.length} questions to "${skill.name}"`);
                }
            } else {
                console.log(`"${skill.name}" already has ${existingQuestions.length} questions, skipping...`);
            }
        }

        console.log('Done adding questions!');
        process.exit(0);
    } catch (error) {
        console.error('Error adding questions:', error);
        process.exit(1);
    }
}

// Run the script
addQuestionsToSkills();

