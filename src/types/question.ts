export type Question = {
    description: string;
    options: string[];
    type: 'open' | "multiple-choice"
}