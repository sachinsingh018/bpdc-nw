import { createUser } from './lib/db/queries';

const randomNames = [
    'Alice Smith', 'Bob Johnson', 'Charlie Lee', 'Diana Patel', 'Ethan Kim',
    'Fiona Chen', 'George Brown', 'Hannah Wilson', 'Ivan Garcia', 'Julia Rossi',
    'Kevin Wang', 'Laura Martinez', 'Mike Anderson', 'Nina Singh', 'Oscar Lopez',
    'Priya Gupta', 'Quentin Dubois', 'Rita Müller', 'Samir Ali', 'Tina Novak'
];

const industries = [
    'technology', 'finance', 'healthcare', 'education', 'marketing', 'consulting', 'real estate', 'media', 'logistics', 'tourism'
];

const strengths = [
    'leadership', 'communication', 'problem-solving', 'teamwork', 'creativity', 'adaptability', 'project management', 'data analysis', 'sales', 'networking'
];

const interests = [
    'startups', 'AI', 'blockchain', 'sustainability', 'fintech', 'travel', 'sports', 'music', 'reading', 'mentoring'
];

const goals = [
    'grow my network', 'find a mentor', 'explore new industries', 'build a startup', 'learn new skills', 'advance my career', 'find investment', 'collaborate on projects', 'share knowledge', 'discover opportunities'
];

function randomFrom(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
    for (let i = 0; i < 15; i++) {
        const name = randomNames[i % randomNames.length];
        const email = `user${i + 2}@example.com`;
        const password = 'Password123!';
        const linkedinInfo = `${name} is a professional in ${randomFrom(industries)} with strengths in ${randomFrom(strengths)}. Interested in ${randomFrom(interests)}.`;
        await createUser({
            name,
            email,
            password,
            linkedinInfo,
            goals: randomFrom(goals),
            strengths: randomFrom(strengths),
            interests: randomFrom(interests),
        });
        console.log(`Seeded user: ${name} (${email})`);
    }
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
}); 